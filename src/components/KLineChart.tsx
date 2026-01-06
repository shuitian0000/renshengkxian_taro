import {ScrollView, Text, View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {DayunPeriod, KLineDataPoint} from '@/utils/kline'

interface KLineChartProps {
  data: KLineDataPoint[]
  dayunPeriods: DayunPeriod[]
  fullscreen?: boolean
}

// 根据年龄和运势生成具体的分析依据
function generateAnalysisBasis(point: KLineDataPoint): string {
  const {age, score, trend} = point
  const isAuspicious = trend === '吉'

  // 人生阶段判断
  let lifeStage = ''
  let stageAdvice = ''
  let specificEvent = ''

  if (age <= 18) {
    lifeStage = '少年求学阶段'
    if (isAuspicious) {
      stageAdvice = '学业运势旺盛，理解力强，记忆力佳'
      specificEvent = age <= 12 ? '基础教育顺利，成绩优异' : '中学阶段表现突出，有望考入理想学府'
    } else {
      stageAdvice = '学业需加倍努力，注意力易分散'
      specificEvent = age <= 12 ? '基础知识需巩固，多请教师长' : '学习压力较大，需调整方法，劳逸结合'
    }
  } else if (age <= 30) {
    lifeStage = '青年创业阶段'
    if (isAuspicious) {
      stageAdvice = '事业运势上扬，贵人相助，机遇频现'
      specificEvent = age <= 25 ? '初入职场即展露才华，获上司赏识' : '事业上升期，适合跳槽或创业，财运亦佳'
    } else {
      stageAdvice = '事业发展受阻，竞争激烈，需沉淀积累'
      specificEvent = age <= 25 ? '职场适应期较长，需多学习技能' : '事业遇瓶颈，宜稳扎稳打，避免冒进投资'
    }
  } else if (age <= 45) {
    lifeStage = '中年发展阶段'
    if (isAuspicious) {
      stageAdvice = '事业财运俱佳，地位稳固，影响力扩大'
      specificEvent =
        age <= 38 ? '事业巅峰期，适合扩展业务，投资回报丰厚' : '成熟期，宜传承经验，培养团队，财富稳定增长'
    } else {
      stageAdvice = '运势起伏较大，需谨慎决策，守成为主'
      specificEvent =
        age <= 38 ? '事业压力增大，需平衡工作与家庭，避免过度扩张' : '进入调整期，宜保守理财，关注健康，减少应酬'
    }
  } else if (age <= 60) {
    lifeStage = '成熟稳定阶段'
    if (isAuspicious) {
      stageAdvice = '运势平稳向好，经验丰富，受人尊重'
      specificEvent =
        age <= 52 ? '事业稳定，收入可观，宜规划退休生活' : '逐步交接工作，享受生活，子女事业有成，家庭和睦'
    } else {
      stageAdvice = '健康需多关注，心态宜平和，减少劳累'
      specificEvent =
        age <= 52 ? '工作压力仍大，需注意身体信号，定期体检' : '退休过渡期，需调整心态，培养兴趣爱好，多陪伴家人'
    }
  } else {
    lifeStage = '晚年颐养阶段'
    if (isAuspicious) {
      stageAdvice = '福寿安康，儿孙绕膝，晚年幸福'
      specificEvent = age <= 70 ? '身体硬朗，精神矍铄，享受天伦之乐' : '高寿之年，心态平和，子孙孝顺，安度晚年'
    } else {
      stageAdvice = '注意身体保养，心态宜平和，清心寡欲'
      specificEvent = age <= 70 ? '健康需重点关注，适度运动，清淡饮食' : '身体机能下降，需家人照料，保持乐观心态'
    }
  }

  // 五行分析（根据评分细化）
  let wuxingAnalysis = ''
  if (isAuspicious) {
    if (score >= 8) {
      wuxingAnalysis = '五行流转极为顺畅，金木水火土相生相助，天时地利人和，诸事易成'
    } else if (score >= 7) {
      wuxingAnalysis = '五行平衡良好，气场和谐，运势稳步上升，顺势而为可获成功'
    } else {
      wuxingAnalysis = '五行基本平衡，略有波动，整体向好，需把握时机'
    }
  } else {
    if (score < 4) {
      wuxingAnalysis = '五行相克严重，气场紊乱，需调和阴阳，化解不利，宜求助专业人士'
    } else if (score < 5) {
      wuxingAnalysis = '五行失衡较重，运势受阻，需注意调整心态，避免冲动决策'
    } else {
      wuxingAnalysis = '五行略有相克，运势起伏，需谨慎行事，以守为攻'
    }
  }

  // 综合分析
  return `【${lifeStage}】${specificEvent}。${stageAdvice}。【五行命理】${wuxingAnalysis}。【综合评分】${score.toFixed(1)}分，运势${isAuspicious ? '向好' : '欠佳'}，建议${isAuspicious ? '积极把握机遇，顺势而为' : '谨慎行事，蓄势待发，修身养性'}。`
}

export default function KLineChart({data, dayunPeriods, fullscreen = false}: KLineChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<KLineDataPoint | null>(null)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const updateOrientation = () => {
      Taro.getSystemInfo({
        success: (res) => {
          setIsLandscape(res.windowWidth > res.windowHeight)
        }
      })
    }
    updateOrientation()
    const interval = setInterval(updateOrientation, 500)
    return () => clearInterval(interval)
  }, [])

  const chartWidth = useMemo(() => data.length * 30, [data.length])
  const chartHeight = fullscreen ? (isLandscape ? 500 : 600) : isLandscape ? 300 : 400

  const yAxisLabels = useMemo(() => {
    const labels: number[] = []
    for (let i = 0; i <= 10; i += 2) {
      labels.push(i)
    }
    return labels.reverse()
  }, [])

  const getYPosition = (value: number) => {
    return ((10 - value) / 10) * (chartHeight - 80) + 40
  }

  const handlePointClick = useCallback((point: KLineDataPoint) => {
    setSelectedPoint(point)
  }, [])

  const closeDetail = useCallback(() => {
    setSelectedPoint(null)
  }, [])

  return (
    <View className={`w-full ${fullscreen ? 'h-screen' : isLandscape ? 'h-72' : 'h-96'} bg-card relative`}>
      <ScrollView scrollX scrollY={false} className="w-full h-full" style={{background: 'transparent'}}>
        <View className="relative" style={{width: `${chartWidth}px`, height: `${chartHeight}px`}}>
          <View className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-10">
            {yAxisLabels.map((label) => (
              <Text key={label} className="text-xs text-muted-foreground text-right pr-2">
                {label}
              </Text>
            ))}
          </View>

          <View className="absolute left-12 right-0 top-10 bottom-10">
            {yAxisLabels.map((label) => (
              <View
                key={label}
                className="absolute w-full border-t border-border"
                style={{top: `${((10 - label) / 10) * 100}%`}}
              />
            ))}
          </View>

          {dayunPeriods.map((period, index) => {
            const startIndex = data.findIndex((d) => d.age === period.startAge)
            if (startIndex === -1) return null
            return (
              <View key={index}>
                <View
                  className="absolute top-10 bottom-10 border-l-2 border-l-dashed"
                  style={{left: `${startIndex * 30 + 60}px`, borderColor: 'hsl(var(--chart-dayun))'}}
                />
                <Text
                  className="absolute text-xs"
                  style={{left: `${startIndex * 30 + 65}px`, top: '10px', color: 'hsl(var(--chart-dayun))'}}>
                  {period.ganZhi}
                </Text>
              </View>
            )
          })}

          {data.map((point, index) => {
            const x = index * 30 + 60
            const openY = getYPosition(point.open)
            const closeY = getYPosition(point.close)
            const highY = getYPosition(point.high)
            const lowY = getYPosition(point.low)
            // 使用trend字段判断吉凶
            const isAuspicious = point.trend === '吉'
            const color = isAuspicious ? 'hsl(var(--chart-auspicious))' : 'hsl(var(--chart-inauspicious))'
            const bodyHeight = Math.abs(closeY - openY)
            const bodyTop = Math.min(openY, closeY)

            return (
              <View key={index} className="absolute" style={{left: `${x}px`}} onClick={() => handlePointClick(point)}>
                <View
                  className="absolute w-px"
                  style={{left: '10px', top: `${highY}px`, height: `${bodyTop - highY}px`, backgroundColor: color}}
                />
                <View
                  className="absolute w-5 rounded-sm"
                  style={{
                    left: '5px',
                    top: `${bodyTop}px`,
                    height: `${Math.max(bodyHeight, 2)}px`,
                    backgroundColor: color
                  }}
                />
                <View
                  className="absolute w-px"
                  style={{
                    left: '10px',
                    top: `${bodyTop + bodyHeight}px`,
                    height: `${lowY - (bodyTop + bodyHeight)}px`,
                    backgroundColor: color
                  }}
                />
                {index % 5 === 0 && (
                  <Text
                    className="absolute text-xs text-muted-foreground"
                    style={{left: '-5px', top: `${chartHeight - 30}px`}}>
                    {point.age}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      {selectedPoint && (
        <View
          className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={closeDetail}>
          <View
            className="bg-card rounded-lg p-6 max-w-md w-full shadow-elegant space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <View className="flex items-center justify-between border-b border-border pb-3">
              <Text className="text-lg font-bold text-card-foreground">{selectedPoint.age}岁运势</Text>
              <View className="i-mdi-close text-2xl text-muted-foreground btn-press" onClick={closeDetail} />
            </View>

            <View className="space-y-3">
              <View className="flex items-center justify-between">
                <Text className="text-sm text-muted-foreground">运势评分</Text>
                <View className="flex items-center gap-2">
                  <Text className="text-2xl font-bold text-primary">{selectedPoint.score.toFixed(1)}</Text>
                  <Text className="text-sm text-muted-foreground">/ 10</Text>
                </View>
              </View>

              <View className="flex items-center justify-between">
                <Text className="text-sm text-muted-foreground">吉凶趋势</Text>
                <Text
                  className={`text-sm font-bold ${selectedPoint.trend === '吉' ? 'text-chart-auspicious' : 'text-chart-inauspicious'}`}>
                  {selectedPoint.trend === '吉' ? '运势向好' : '运势欠佳'}
                </Text>
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-bold text-card-foreground">运势分析</Text>
                <Text className="text-sm text-muted-foreground leading-relaxed">
                  {selectedPoint.description ||
                    (selectedPoint.trend === '吉'
                      ? '此年运势向好，诸事顺遂，宜积极进取，把握机遇。'
                      : '此年运势欠佳，多有波折，宜谨慎行事，稳中求进。')}
                </Text>
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-bold text-card-foreground">分析依据</Text>
                <Text className="text-xs text-muted-foreground leading-relaxed">
                  {generateAnalysisBasis(selectedPoint)}
                </Text>
              </View>
            </View>

            <View className="pt-3 border-t border-border">
              <View className="w-full py-3 rounded-lg bg-primary text-center btn-press" onClick={closeDetail}>
                <Text className="text-primary-foreground font-bold">关闭</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
