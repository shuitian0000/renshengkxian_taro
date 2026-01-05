import {ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import KLineChart from '@/components/KLineChart'
import {getCurrentUser, saveReport} from '@/db/api'

export default function Chart() {
  const [reportData, setReportData] = useState<any>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [saving, setSaving] = useState(false)

  useDidShow(() => {
    // 从缓存读取报告数据
    const data = Taro.getStorageSync('currentReport')
    if (data) {
      setReportData(data)
    } else {
      Taro.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.switchTab({url: '/pages/index/index'})
      }, 1500)
    }
  })

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    setFullscreen(!fullscreen)
  }, [fullscreen])

  // 查看报告详情
  const viewReport = useCallback(() => {
    Taro.navigateTo({url: '/pages/report/index'})
  }, [])

  // 保存报告
  const handleSave = useCallback(async () => {
    // 检查登录状态
    const {
      data: {session}
    } = await supabase.auth.getSession()
    if (!session) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再保存报告',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.setStorageSync('loginRedirectPath', '/pages/chart/index')
            Taro.switchTab({url: '/pages/profile/index'})
          }
        }
      })
      return
    }

    setSaving(true)
    Taro.showLoading({title: '保存中...', mask: true})

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('获取用户信息失败')
      }

      const saved = await saveReport({
        user_id: user.id,
        name: reportData.name,
        birth_date: reportData.birthDate,
        birth_time: reportData.birthTime,
        birth_region: reportData.birthRegion,
        calendar_type: reportData.calendarType,
        face_image_url: reportData.faceImageUrl,
        kline_data: reportData.klineData,
        report_data: reportData.reportData
      })

      Taro.hideLoading()

      if (saved) {
        Taro.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存报告失败:', error)
      Taro.hideLoading()
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      setSaving(false)
    }
  }, [reportData])

  // 重新推演
  const handleRegenerate = useCallback(async () => {
    Taro.showModal({
      title: '重新推演',
      content: '将使用已输入的信息重新生成报告，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          Taro.showLoading({title: '生成中...', mask: true})

          try {
            // 调用Edge Function重新生成
            const {data: reportResult, error: reportError} = await supabase.functions.invoke(
              'generate-destiny-report',
              {
                body: {
                  name: reportData.name,
                  birthDate: reportData.birthDate,
                  birthTime: reportData.birthTime,
                  birthRegion: reportData.birthRegion,
                  calendarType: reportData.calendarType,
                  faceAnalysis: null
                }
              }
            )

            if (reportError) {
              throw new Error('生成失败')
            }

            // 更新报告数据
            const newReportData = {
              ...reportData,
              klineData: reportResult.klineData,
              reportData: reportResult.report,
              dayunPeriods: reportResult.dayunPeriods
            }

            setReportData(newReportData)
            Taro.setStorageSync('currentReport', newReportData)

            Taro.hideLoading()
            Taro.showToast({
              title: '重新生成成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('重新生成失败:', error)
            Taro.hideLoading()
            Taro.showToast({
              title: '生成失败，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  }, [reportData])

  if (!reportData) {
    return (
      <View className="min-h-screen bg-background flex items-center justify-center">
        <Text className="text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-background">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="space-y-6 pb-8">
          {/* 标题信息 */}
          <View className="bg-gradient-card px-8 py-6 space-y-2">
            <Text className="text-2xl font-bold text-foreground">{reportData.name}的人生K线图</Text>
            <Text className="text-muted-foreground text-sm">
              出生日期：{reportData.birthDate} {reportData.birthTime}
            </Text>
            <Text className="text-muted-foreground text-sm">出生地区：{reportData.birthRegion}</Text>
          </View>

          {/* K线图 */}
          <View className="px-8">
            <View className="bg-card rounded-lg overflow-hidden shadow-elegant">
              <View className="px-4 py-3 border-b border-border flex items-center justify-between">
                <Text className="text-foreground font-bold">运势K线图</Text>
                <View className="flex items-center gap-1 btn-press" onClick={toggleFullscreen}>
                  <View className={`i-mdi-${fullscreen ? 'fullscreen-exit' : 'fullscreen'} text-xl text-primary`} />
                  <Text className="text-primary text-sm">{fullscreen ? '退出全屏' : '全屏查看'}</Text>
                </View>
              </View>
              <KLineChart data={reportData.klineData} dayunPeriods={reportData.dayunPeriods} fullscreen={fullscreen} />
            </View>
          </View>

          {/* 图例说明 */}
          <View className="px-8">
            <View className="bg-card rounded-lg p-4 space-y-3">
              <Text className="text-foreground font-bold text-sm">图例说明</Text>
              <View className="flex items-center gap-4">
                <View className="flex items-center gap-2">
                  <View className="w-4 h-4 rounded-sm" style={{backgroundColor: 'hsl(var(--chart-auspicious))'}} />
                  <Text className="text-muted-foreground text-xs">吉运</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View className="w-4 h-4 rounded-sm" style={{backgroundColor: 'hsl(var(--chart-inauspicious))'}} />
                  <Text className="text-muted-foreground text-xs">凶运</Text>
                </View>
                <View className="flex items-center gap-2">
                  <View
                    className="w-4 h-px border-t-2 border-t-dashed"
                    style={{borderColor: 'hsl(var(--chart-dayun))'}}
                  />
                  <Text className="text-muted-foreground text-xs">大运周期</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 操作按钮 */}
          <View className="px-8 space-y-4">
            <View className="w-full py-4 rounded bg-primary text-center btn-press" onClick={viewReport}>
              <Text className="text-primary-foreground font-bold">查看详细报告</Text>
            </View>

            <View className="flex gap-4">
              <View
                className="flex-1 py-4 rounded border border-border text-center btn-press"
                onClick={handleRegenerate}>
                <Text className="text-foreground">重新推演</Text>
              </View>
              <View
                className={`flex-1 py-4 rounded text-center btn-press ${saving ? 'bg-muted' : 'bg-secondary'}`}
                onClick={saving ? undefined : handleSave}>
                <Text className={saving ? 'text-muted-foreground' : 'text-secondary-foreground'}>
                  {saving ? '保存中...' : '保存报告'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
