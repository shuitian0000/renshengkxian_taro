import {Input, ScrollView, Text, View} from '@tarojs/components'
import Taro, {getEnv, useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import {getCurrentUser, type Profile} from '@/db/api'

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [loginMode, setLoginMode] = useState<'username' | 'wechat'>('username')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

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
        setUser(currentUser)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  }, [])

  // 用户名密码登录
  const handleUsernameLogin = useCallback(async () => {
    if (!username || !password) {
      Taro.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    if (!agreed) {
      Taro.showToast({
        title: '请同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }

    setLoading(true)

    try {
      // 模拟邮箱格式
      const email = `${username}@miaoda.com`

      // 尝试登录
      const {data: signInData, error: signInError} = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // 如果登录失败，尝试注册
        const {data: signUpData, error: signUpError} = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        })

        if (signUpError) {
          throw signUpError
        }

        Taro.showToast({
          title: '注册成功',
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })
      }

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
      } else {
        checkLoginStatus()
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [username, password, agreed, checkLoginStatus])

  // 微信登录
  const handleWechatLogin = useCallback(async () => {
    if (getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({
        title: '微信授权登录请在小程序体验，网页端请使用用户名密码登录',
        icon: 'none'
      })
      return
    }

    if (!agreed) {
      Taro.showToast({
        title: '请同意用户协议和隐私政策',
        icon: 'none'
      })
      return
    }

    setLoading(true)

    try {
      const loginResult = await Taro.login()
      const {data, error} = await supabase.functions.invoke('wechat-miniprogram-login', {
        body: {code: loginResult?.code}
      })

      if (error) {
        const errorMsg = (await error?.context?.text?.()) || error.message
        throw new Error(errorMsg)
      }

      const {data: session} = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: 'email'
      })

      if (session) {
        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })

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
        } else {
          checkLoginStatus()
        }
      }
    } catch (error: any) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [agreed, checkLoginStatus])

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
            icon: 'success'
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
              <View className="i-mdi-account-circle text-8xl text-primary mx-auto" />
              <Text className="text-foreground text-xl font-bold block">
                {user.nickname || user.username || '用户'}
              </Text>
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
              <Text className="text-muted-foreground text-xs block">© 2026 人生K线图</Text>
              <Text className="text-muted-foreground text-xs block">基于传统命理，洞察人生运势</Text>
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

          {/* 登录方式切换 */}
          <View className="flex gap-4">
            <View
              className={`flex-1 py-3 rounded border text-center btn-press ${
                loginMode === 'username' ? 'bg-primary border-primary' : 'bg-card border-border'
              }`}
              onClick={() => setLoginMode('username')}>
              <Text className={loginMode === 'username' ? 'text-primary-foreground' : 'text-foreground'}>
                用户名登录
              </Text>
            </View>
            <View
              className={`flex-1 py-3 rounded border text-center btn-press ${
                loginMode === 'wechat' ? 'bg-primary border-primary' : 'bg-card border-border'
              }`}
              onClick={() => setLoginMode('wechat')}>
              <Text className={loginMode === 'wechat' ? 'text-primary-foreground' : 'text-foreground'}>微信登录</Text>
            </View>
          </View>

          {/* 登录表单 */}
          <View className="bg-card rounded-lg p-6 space-y-6">
            {loginMode === 'username' ? (
              <>
                <View className="space-y-2">
                  <Text className="text-foreground text-sm">用户名</Text>
                  <View className="bg-input rounded border border-border px-4 py-3">
                    <Input
                      className="w-full text-foreground"
                      placeholder="请输入用户名"
                      value={username}
                      onInput={(e) => setUsername(e.detail.value)}
                      style={{padding: 0, border: 'none', background: 'transparent'}}
                    />
                  </View>
                </View>

                <View className="space-y-2">
                  <Text className="text-foreground text-sm">密码</Text>
                  <View className="bg-input rounded border border-border px-4 py-3">
                    <Input
                      className="w-full text-foreground"
                      placeholder="请输入密码"
                      type="password"
                      value={password}
                      onInput={(e) => setPassword(e.detail.value)}
                      style={{padding: 0, border: 'none', background: 'transparent'}}
                    />
                  </View>
                </View>
              </>
            ) : (
              <View className="text-center py-8 space-y-4">
                <View className="i-mdi-wechat text-8xl text-primary mx-auto" />
                <Text className="text-muted-foreground text-sm block">点击下方按钮使用微信授权登录</Text>
              </View>
            )}

            {/* 用户协议 */}
            <View className="flex items-center gap-2" onClick={() => setAgreed(!agreed)}>
              <View
                className={`w-5 h-5 rounded border flex items-center justify-center ${agreed ? 'bg-primary border-primary' : 'border-border'}`}>
                {agreed && <View className="i-mdi-check text-white text-sm" />}
              </View>
              <Text className="text-muted-foreground text-xs">我已阅读并同意《用户协议》和《隐私政策》</Text>
            </View>

            {/* 登录按钮 */}
            {loginMode === 'username' ? (
              <View
                className={`w-full py-4 rounded text-center btn-press ${loading ? 'bg-muted' : 'bg-primary'}`}
                onClick={loading ? undefined : handleUsernameLogin}>
                <Text className={loading ? 'text-muted-foreground' : 'text-primary-foreground font-bold'}>
                  {loading ? '登录中...' : '登录 / 注册'}
                </Text>
              </View>
            ) : (
              <View
                className={`w-full py-4 rounded text-center btn-press ${loading ? 'bg-muted' : 'bg-primary'}`}
                onClick={loading ? undefined : handleWechatLogin}>
                <Text className={loading ? 'text-muted-foreground' : 'text-primary-foreground font-bold'}>
                  {loading ? '登录中...' : '微信授权登录'}
                </Text>
              </View>
            )}
          </View>

          {/* 说明 */}
          <View className="bg-card rounded-lg p-6 space-y-2">
            <Text className="text-foreground text-sm font-bold">温馨提示</Text>
            <Text className="text-muted-foreground text-xs">首次使用自动注册账号，无需额外操作</Text>
            <Text className="text-muted-foreground text-xs">登录后可保存报告记录，随时查看历史报告</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
