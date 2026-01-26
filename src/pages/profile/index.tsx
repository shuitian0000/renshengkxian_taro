import {Button, Input, ScrollView, Text, View} from '@tarojs/components'
import Taro, {getEnv, useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import {getCurrentUser, type Profile} from '@/db/api'

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nickname, setNickname] = useState('')

  useDidShow(() => {
    checkLoginStatus()
  })

  const checkLoginStatus = useCallback(async () => {
    try {
      const {
        data: {session}
      } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
        const currentUser = await getCurrentUser()
        console.log('获取到的用户信息:', currentUser)
        setUser(currentUser)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }, [])

  // 选择头像
  const handleChooseAvatar = useCallback((e: any) => {
    const {avatarUrl} = e.detail
    setAvatarUrl(avatarUrl)
    console.log('选择头像:', avatarUrl)
  }, [])

  // 输入昵称
  const handleNicknameInput = useCallback((e: any) => {
    const value = e.detail.value
    setNickname(value)
    console.log('输入昵称:', value)
  }, [])

  // 微信登录
  const handleWechatLogin = useCallback(async () => {
    if (getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({
        title: '微信授权登录仅支持小程序环境',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!agreed) {
      Taro.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 检查是否已选择头像和输入昵称
    if (!avatarUrl || !nickname) {
      Taro.showToast({
        title: '请先选择头像并输入昵称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    setLoading(true)

    try {
      // 获取登录凭证
      const loginResult = await Taro.login()
      if (!loginResult.code) {
        throw new Error('获取登录凭证失败')
      }

      // 调用后端登录接口，传递用户选择的头像和昵称
      console.log('发送登录请求，参数:', {
        code: loginResult.code,
        nickName: nickname,
        avatarUrl: avatarUrl
      })

      const {data, error} = await supabase.functions.invoke('wechat-miniprogram-login', {
        body: {
          code: loginResult.code,
          nickName: nickname,
          avatarUrl: avatarUrl
        }
      })

      if (error) {
        const errorMsg = (await error?.context?.text?.()) || error.message
        console.error('登录接口调用失败:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('登录接口返回:', data)

      const {data: session} = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: 'email'
      })

      if (session) {
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })

        // 等待一下确保后端数据已保存
        await new Promise((resolve) => setTimeout(resolve, 500))

        // 重新获取用户信息
        await checkLoginStatus()

        // 检查是否有重定向路径
        const redirectPath = Taro.getStorageSync('loginRedirectPath')
        if (redirectPath) {
          Taro.removeStorageSync('loginRedirectPath')
          const tabBarPages = ['/pages/index/index', '/pages/history/index', '/pages/profile/index']
          if (tabBarPages.includes(redirectPath)) {
            Taro.switchTab({url: redirectPath})
          } else {
            Taro.navigateTo({url: redirectPath})
          }
        }
      }
    } catch (error: any) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [agreed, avatarUrl, nickname, checkLoginStatus])

  // 退出登录
  const handleLogout = useCallback(async () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          await supabase.auth.signOut()
          Taro.clearStorage()
          setIsLoggedIn(false)
          setUser(null)
          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  }, [])

  if (isLoggedIn && user) {
    return (
      <View className="min-h-screen bg-background">
        <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
          <View className="px-8 py-12 space-y-8">
            {/* 用户信息卡片 */}
            <View className="bg-gradient-card rounded-lg p-8 shadow-elegant text-center space-y-4">
              {user.avatar_url ? (
                <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary mx-auto">
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                </View>
              ) : (
                <View className="i-mdi-account-circle text-8xl text-primary mx-auto" />
              )}
              <Text className="text-foreground text-xl font-bold block">{user.nickname || '用户'}</Text>
              <Text className="text-muted-foreground text-sm block">
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </Text>
            </View>

            {/* 功能菜单 */}
            <View className="space-y-4">
              <View
                className="bg-card rounded-lg p-6 flex items-center justify-between btn-press"
                onClick={() => Taro.switchTab({url: '/pages/history/index'})}>
                <View className="flex items-center gap-4">
                  <View className="i-mdi-history text-2xl text-primary" />
                  <Text className="text-foreground">历史记录</Text>
                </View>
                <View className="i-mdi-chevron-right text-2xl text-muted-foreground" />
              </View>

              <View
                className="bg-card rounded-lg p-6 flex items-center justify-between btn-press"
                onClick={handleLogout}>
                <View className="flex items-center gap-4">
                  <View className="i-mdi-logout text-2xl text-destructive" />
                  <Text className="text-destructive">退出登录</Text>
                </View>
                <View className="i-mdi-chevron-right text-2xl text-muted-foreground" />
              </View>
            </View>

            {/* 版权信息 */}
            <View className="text-center space-y-2">
              <Text className="text-muted-foreground text-xs block">© 2026 人生趋势图谱</Text>
              <Text className="text-muted-foreground text-xs block">基于传统数据，洞察人生趋势</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-background">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-8 py-12 space-y-8">
          {/* 标题 */}
          <View className="text-center space-y-4">
            <Text className="text-3xl font-bold gradient-text block">欢迎使用</Text>
            <Text className="text-muted-foreground text-sm block">登录后可保存和查看历史报告</Text>
          </View>

          {/* 微信登录卡片 */}
          <View className="bg-card rounded-lg p-8 space-y-6">
            {/* 微信图标 */}
            <View className="text-center space-y-4">
              <View className="i-mdi-wechat text-8xl text-primary mx-auto" />
              <Text className="text-foreground text-lg font-bold block">微信授权登录</Text>
            </View>

            {/* 头像昵称填写 */}
            <View className="space-y-4">
              <Text className="text-foreground text-sm font-bold block">完善个人信息</Text>

              {/* 头像选择 */}
              <View className="flex flex-col items-center gap-3">
                <View className="relative">
                  {avatarUrl ? (
                    <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                      <img src={avatarUrl} className="w-full h-full object-cover" />
                    </View>
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <View className="i-mdi-account text-4xl text-muted-foreground" />
                    </View>
                  )}
                </View>
                <Button
                  className="bg-primary/10 text-primary py-2 px-6 rounded break-keep text-sm"
                  size="default"
                  openType="chooseAvatar"
                  onChooseAvatar={handleChooseAvatar}>
                  选择微信头像
                </Button>
              </View>

              {/* 昵称输入 */}
              <View className="space-y-2">
                <Text className="text-muted-foreground text-xs block">昵称</Text>
                <View className="bg-input rounded border border-border px-4 py-3">
                  <Input
                    type="nickname"
                    className="w-full text-foreground"
                    style={{padding: 0, border: 'none', background: 'transparent'}}
                    placeholder="请输入昵称"
                    placeholderClass="text-muted-foreground"
                    value={nickname}
                    onInput={handleNicknameInput}
                  />
                </View>
                <Text className="text-muted-foreground text-xs block">提示：点击输入框可快速填写微信昵称</Text>
              </View>
            </View>

            {/* 权限说明 */}
            <View className="bg-muted/30 rounded-lg p-4 space-y-3">
              <View className="flex items-start gap-3">
                <View className="i-mdi-information text-xl text-primary flex-shrink-0" style={{marginTop: '2px'}} />
                <View className="flex-1 space-y-2">
                  <Text className="text-foreground text-sm font-bold block">授权说明</Text>
                  <Text className="text-muted-foreground text-xs leading-relaxed block">
                    您选择的头像和昵称将用于：
                  </Text>
                </View>
              </View>

              <View className="space-y-2 pl-8">
                <View className="flex items-start gap-2">
                  <View className="i-mdi-check-circle text-sm text-primary flex-shrink-0" style={{marginTop: '2px'}} />
                  <Text className="text-muted-foreground text-xs leading-relaxed">完善您的个人资料</Text>
                </View>
                <View className="flex items-start gap-2">
                  <View className="i-mdi-check-circle text-sm text-primary flex-shrink-0" style={{marginTop: '2px'}} />
                  <Text className="text-muted-foreground text-xs leading-relaxed">保存和管理您的分析报告</Text>
                </View>
                <View className="flex items-start gap-2">
                  <View className="i-mdi-check-circle text-sm text-primary flex-shrink-0" style={{marginTop: '2px'}} />
                  <Text className="text-muted-foreground text-xs leading-relaxed">提供个性化的服务体验</Text>
                </View>
              </View>

              <View className="border-t border-border pt-3 mt-3">
                <Text className="text-muted-foreground text-xs leading-relaxed block">
                  我们承诺严格保护您的隐私，不会将您的信息用于其他用途。
                </Text>
              </View>
            </View>

            {/* 用户协议 */}
            <View className="flex items-start gap-3" onClick={() => setAgreed(!agreed)}>
              <View
                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-primary border-primary' : 'border-border'}`}
                style={{marginTop: '2px'}}>
                {agreed && <View className="i-mdi-check text-white text-sm" />}
              </View>
              <Text className="text-muted-foreground text-xs leading-relaxed">
                我已阅读并同意《用户协议》和《隐私政策》
              </Text>
            </View>

            {/* 登录按钮 */}
            <View
              className={`w-full py-4 rounded-lg text-center btn-press ${loading ? 'bg-muted' : 'bg-primary'}`}
              onClick={loading ? undefined : handleWechatLogin}>
              <Text className={loading ? 'text-muted-foreground font-bold' : 'text-primary-foreground font-bold'}>
                {loading ? '登录中...' : '确认登录'}
              </Text>
            </View>

            {/* 提示信息 */}
            <View className="text-center">
              <Text className="text-muted-foreground text-xs block">登录即表示您同意授权使用所填写的信息</Text>
            </View>
          </View>

          {/* 版权信息 */}
          <View className="text-center space-y-2">
            <Text className="text-muted-foreground text-xs block">© 2026 人生趋势图谱</Text>
            <Text className="text-muted-foreground text-xs block">基于传统数据，洞察人生趋势</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
