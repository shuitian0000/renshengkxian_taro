import {Button, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import KLineChart from '@/components/KLineChart'

export default function ChartFullscreen() {
  const [reportData, setReportData] = useState<any>(null)
  const [scale, setScale] = useState(0.8) // 默认0.8倍，让K线图更容易看全
  const [_translateX, setTranslateX] = useState(0)
  const [_translateY, setTranslateY] = useState(0)

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
    setScale((prev) => {
      const newScale = Math.min(prev + 0.3, 3)
      console.log('handleZoomIn: prev=', prev, 'newScale=', newScale)
      return newScale
    })
  }, [])

  // 缩小
  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.3, 0.3)
      console.log('handleZoomOut: prev=', prev, 'newScale=', newScale)
      return newScale
    })
  }, [])

  // 重置
  const handleReset = useCallback(() => {
    console.log('handleReset: scale=0.8')
    setScale(0.8)
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
      {/* K线图 - 横屏全屏显示，支持缩放 */}
      <View className="w-full h-screen">
        <KLineChart
          key={`kline-${scale}`}
          data={reportData.klineData}
          dayunPeriods={reportData.dayunPeriods}
          fullscreen={true}
          scale={scale}
        />
      </View>

      {/* 控制按钮组 - 横向排列，固定在底部中央 */}
      <View className="fixed bottom-4 left-1/2 z-50 flex items-center gap-3" style={{transform: 'translateX(-50%)'}}>
        {/* 放大按钮 */}
        <Button
          className="bg-card/90 text-card-foreground w-12 h-12 rounded-full border border-border flex items-center justify-center btn-press shadow-lg"
          size="mini"
          onClick={handleZoomIn}>
          <View className="i-mdi-plus text-2xl" />
        </Button>

        {/* 缩小按钮 */}
        <Button
          className="bg-card/90 text-card-foreground w-12 h-12 rounded-full border border-border flex items-center justify-center btn-press shadow-lg"
          size="mini"
          onClick={handleZoomOut}>
          <View className="i-mdi-minus text-2xl" />
        </Button>

        {/* 重置按钮 */}
        <Button
          className="bg-card/90 text-card-foreground w-12 h-12 rounded-full border border-border flex items-center justify-center btn-press shadow-lg"
          size="mini"
          onClick={handleReset}>
          <View className="i-mdi-refresh text-2xl" />
        </Button>

        {/* 退出按钮 */}
        <Button
          className="bg-accent/90 text-accent-foreground px-5 py-3 rounded-full border border-border break-keep text-sm btn-press shadow-lg"
          size="mini"
          onClick={handleExit}>
          退出全屏
        </Button>
      </View>
    </View>
  )
}
