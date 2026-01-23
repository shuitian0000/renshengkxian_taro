import {ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import {deleteReport, getUserReports, type Report} from '@/db/api'

export default function History() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useDidShow(() => {
    loadReports()
  })

  const loadReports = useCallback(async () => {
    setLoading(true)

    try {
      const {
        data: {session}
      } = await supabase.auth.getSession()
      if (!session) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)
      const {
        data: {user}
      } = await supabase.auth.getUser()
      if (user) {
        const userReports = await getUserReports(user.id)
        setReports(userReports)
      }
    } catch (error) {
      console.error('加载报告列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleViewReport = useCallback((report: Report) => {
    // 将报告数据存储到缓存
    Taro.setStorageSync('currentReport', {
      name: report.name,
      birthDate: report.birth_date,
      birthTime: report.birth_time,
      birthRegion: report.birth_region,
      calendarType: report.calendar_type,
      faceImageUrl: report.face_image_url,
      klineData: report.kline_data,
      reportData: report.report_data,
      dayunPeriods: report.kline_data ? [] : []
    })

    // 跳转到K线图页面
    Taro.navigateTo({url: '/pages/chart/index'})
  }, [])

  const handleDeleteReport = useCallback(
    (reportId: string) => {
      Taro.showModal({
        title: '确认删除',
        content: '删除后无法恢复，是否继续？',
        success: async (res) => {
          if (res.confirm) {
            const success = await deleteReport(reportId)
            if (success) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
              loadReports()
            } else {
              Taro.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    [loadReports]
  )

  const goToLogin = useCallback(() => {
    Taro.setStorageSync('loginRedirectPath', '/pages/history/index')
    Taro.switchTab({url: '/pages/profile/index'})
  }, [])

  if (loading) {
    return (
      <View className="min-h-screen bg-background flex items-center justify-center">
        <Text className="text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  if (!isLoggedIn) {
    return (
      <View className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <View className="i-mdi-account-circle text-8xl text-muted-foreground mb-6" />
        <Text className="text-foreground text-lg font-bold mb-2">请先登录</Text>
        <Text className="text-muted-foreground text-sm mb-8 text-center">登录后可查看历史报告记录</Text>
        <View className="w-full py-4 rounded bg-primary text-center btn-press" onClick={goToLogin}>
          <Text className="text-primary-foreground font-bold">去登录</Text>
        </View>
      </View>
    )
  }

  if (reports.length === 0) {
    return (
      <View className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
        <View className="i-mdi-file-document-outline text-8xl text-muted-foreground mb-6" />
        <Text className="text-foreground text-lg font-bold mb-2">暂无历史记录</Text>
        <Text className="text-muted-foreground text-sm mb-8 text-center">生成报告后会自动保存到这里</Text>
        <View
          className="w-full py-4 rounded bg-primary text-center btn-press"
          onClick={() => Taro.switchTab({url: '/pages/index/index'})}>
          <Text className="text-primary-foreground font-bold">去生成报告</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-background">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-8 py-8 space-y-4">
          {reports.map((report) => (
            <View key={report.id} className="bg-gradient-card rounded-lg p-6 shadow-elegant space-y-4">
              {/* 报告信息 */}
              <View className="space-y-2">
                <Text className="text-foreground text-lg font-bold">{report.name}的分析报告</Text>
                <Text className="text-muted-foreground text-sm">
                  出生日期：{report.birth_date} {report.birth_time}
                </Text>
                <Text className="text-muted-foreground text-sm">出生地区：{report.birth_region}</Text>
                <Text className="text-muted-foreground text-xs">
                  生成时间：{new Date(report.created_at).toLocaleString('zh-CN')}
                </Text>
              </View>

              {/* 操作按钮 */}
              <View className="flex gap-4">
                <View
                  className="flex-1 py-3 rounded bg-primary text-center btn-press"
                  onClick={() => handleViewReport(report)}>
                  <Text className="text-primary-foreground font-bold">查看</Text>
                </View>
                <View
                  className="flex-1 py-3 rounded border border-destructive text-center btn-press"
                  onClick={() => handleDeleteReport(report.id)}>
                  <Text className="text-destructive">删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
