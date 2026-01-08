import {Button, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import KLineChart from '@/components/KLineChart'

export default function ChartFullscreen() {
  const [reportData, setReportData] = useState<any>(null)
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

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

  // 放大
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3))
  }, [])

  // 缩小
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }, [])

  // 重置
  const handleReset = useCallback(() => {
    setScale(1)
    setTranslateX(0)
    setTranslateY(0)
  }, [])

  if (!reportData) {
    return (
      <View className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <View className="text-muted-foreground">加载中...</View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* K线图 - 横屏全屏显示，支持缩放和拖动 */}
      <View
        className="w-full h-screen"
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease'
        }}>
        <KLineChart data={reportData.klineData} dayunPeriods={reportData.dayunPeriods} fullscreen={true} />
      </View>

      {/* 控制按钮组 - 固定在右上角 */}
      <View className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {/* 放大按钮 */}
        <Button
          className="bg-card/80 text-card-foreground w-12 h-12 rounded-lg border border-border flex items-center justify-center btn-press"
          size="mini"
          onClick={handleZoomIn}>
          <View className="i-mdi-plus text-2xl" />
        </Button>

        {/* 缩小按钮 */}
        <Button
          className="bg-card/80 text-card-foreground w-12 h-12 rounded-lg border border-border flex items-center justify-center btn-press"
          size="mini"
          onClick={handleZoomOut}>
          <View className="i-mdi-minus text-2xl" />
        </Button>

        {/* 重置按钮 */}
        <Button
          className="bg-card/80 text-card-foreground w-12 h-12 rounded-lg border border-border flex items-center justify-center btn-press"
          size="mini"
          onClick={handleReset}>
          <View className="i-mdi-refresh text-2xl" />
        </Button>

        {/* 退出按钮 */}
        <Button
          className="bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg border border-border break-keep text-sm btn-press mt-2"
          size="mini"
          onClick={handleExit}>
          退出全屏
        </Button>
      </View>
    </View>
  )
}
