import {Button, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import KLineChart from '@/components/KLineChart'

export default function ChartFullscreen() {
  const [reportData, setReportData] = useState<any>(null)

  useDidShow(() => {
    // 从storage获取报告数据
    const data = Taro.getStorageSync('currentReport')
    if (data) {
      setReportData(data)
    } else {
      Taro.showToast({title: '数据加载失败', icon: 'none'})
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  })

  const handleExit = useCallback(() => {
    Taro.navigateBack()
  }, [])

  if (!reportData) {
    return (
      <View className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <View className="text-muted-foreground">加载中...</View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gradient-dark relative">
      {/* K线图 - 横屏全屏显示 */}
      <View className="w-full h-screen">
        <KLineChart data={reportData.klineData} dayunPeriods={reportData.dayunPeriods} fullscreen={true} />
      </View>

      {/* 退出按钮 - 固定在右上角 */}
      <View className="fixed top-4 right-4 z-50">
        <Button
          className="bg-card/80 text-card-foreground px-4 py-2 rounded-lg border border-border break-keep text-sm btn-press"
          size="mini"
          onClick={handleExit}>
          退出全屏
        </Button>
      </View>
    </View>
  )
}
