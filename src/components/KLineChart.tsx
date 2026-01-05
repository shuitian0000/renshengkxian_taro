import {ScrollView, Text, View} from '@tarojs/components'
import {useMemo} from 'react'
import type {DayunPeriod, KLineDataPoint} from '@/utils/kline'

interface KLineChartProps {
  data: KLineDataPoint[]
  dayunPeriods: DayunPeriod[]
  fullscreen?: boolean
}

export default function KLineChart({data, dayunPeriods, fullscreen = false}: KLineChartProps) {
  // 计算图表尺寸
  const chartWidth = useMemo(() => {
    return data.length * 30 // 每个数据点30px宽度
  }, [data.length])

  const chartHeight = fullscreen ? 600 : 400

  // 计算Y轴刻度
  const yAxisLabels = useMemo(() => {
    const labels = []
    for (let i = 0; i <= 10; i += 2) {
      labels.push(i)
    }
    return labels.reverse()
  }, [])

  // 计算K线位置
  const getYPosition = (value: number) => {
    return ((10 - value) / 10) * (chartHeight - 80) + 40
  }

  return (
    <View className={`w-full ${fullscreen ? 'h-screen' : 'h-96'} bg-card`}>
      <ScrollView scrollX scrollY={false} className="w-full h-full" style={{background: 'transparent'}}>
        <View className="relative" style={{width: `${chartWidth}px`, height: `${chartHeight}px`}}>
          {/* Y轴刻度 */}
          <View className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-10">
            {yAxisLabels.map((label) => (
              <Text key={label} className="text-xs text-muted-foreground text-right pr-2">
                {label}
              </Text>
            ))}
          </View>

          {/* 网格线 */}
          <View className="absolute left-12 right-0 top-10 bottom-10">
            {yAxisLabels.map((label) => (
              <View
                key={label}
                className="absolute w-full border-t border-border"
                style={{top: `${((10 - label) / 10) * 100}%`}}
              />
            ))}
          </View>

          {/* 大运周期分隔线 */}
          {dayunPeriods.map((period, index) => {
            const startIndex = data.findIndex((d) => d.age === period.startAge)
            if (startIndex === -1) return null

            return (
              <View key={index}>
                {/* 紫色虚线 */}
                <View
                  className="absolute top-10 bottom-10 border-l-2 border-l-dashed"
                  style={{
                    left: `${startIndex * 30 + 60}px`,
                    borderColor: 'hsl(var(--chart-dayun))'
                  }}
                />
                {/* 大运干支标注 */}
                <Text
                  className="absolute text-xs"
                  style={{
                    left: `${startIndex * 30 + 65}px`,
                    top: '10px',
                    color: 'hsl(var(--chart-dayun))'
                  }}>
                  {period.ganZhi}
                </Text>
              </View>
            )
          })}

          {/* K线图 */}
          <View className="absolute left-12 right-0 top-0 bottom-0">
            {data.map((point, index) => {
              const x = index * 30 + 15
              const openY = getYPosition(point.open)
              const closeY = getYPosition(point.close)
              const highY = getYPosition(point.high)
              const lowY = getYPosition(point.low)

              const isRising = point.close >= point.open
              const color = isRising ? 'hsl(var(--chart-auspicious))' : 'hsl(var(--chart-inauspicious))'
              const bodyHeight = Math.abs(closeY - openY)
              const bodyTop = Math.min(openY, closeY)

              return (
                <View key={index} className="absolute" style={{left: `${x}px`}}>
                  {/* 上影线 */}
                  <View
                    className="absolute w-px"
                    style={{
                      left: '7px',
                      top: `${highY}px`,
                      height: `${bodyTop - highY}px`,
                      backgroundColor: color
                    }}
                  />
                  {/* K线实体 */}
                  <View
                    className="absolute w-4 rounded-sm"
                    style={{
                      left: '3px',
                      top: `${bodyTop}px`,
                      height: `${Math.max(bodyHeight, 2)}px`,
                      backgroundColor: color
                    }}
                  />
                  {/* 下影线 */}
                  <View
                    className="absolute w-px"
                    style={{
                      left: '7px',
                      top: `${Math.max(openY, closeY)}px`,
                      height: `${lowY - Math.max(openY, closeY)}px`,
                      backgroundColor: color
                    }}
                  />
                  {/* 年龄标注（每5岁显示一次） */}
                  {point.age % 5 === 0 && (
                    <Text
                      className="absolute text-xs text-muted-foreground"
                      style={{
                        left: '-5px',
                        top: `${chartHeight - 30}px`,
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'left top'
                      }}>
                      {point.age}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>

          {/* X轴标签 */}
          <View className="absolute left-12 bottom-0 right-0 h-10 flex items-center justify-center">
            <Text className="text-xs text-muted-foreground">年龄（虚岁）</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
