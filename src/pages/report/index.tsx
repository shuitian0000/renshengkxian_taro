import {ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useState} from 'react'
import ReportCard from '@/components/ReportCard'

export default function Report() {
  const [reportData, setReportData] = useState<any>(null)

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

  if (!reportData) {
    return (
      <View className="min-h-screen bg-background flex items-center justify-center">
        <Text className="text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  const report = reportData.reportData

  return (
    <View className="min-h-screen bg-background">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-8 py-8 space-y-6">
          {/* 标题 */}
          <View className="text-center space-y-2">
            <Text className="text-2xl font-bold gradient-text block">{reportData.name}的命理报告</Text>
            <Text className="text-muted-foreground text-sm block">
              {reportData.birthDate} {reportData.birthTime}
            </Text>
          </View>

          {/* 命理总评 */}
          {report.summary && (
            <ReportCard title="命理总评" content={report.summary.content} score={report.summary.score} />
          )}

          {/* 性格分析 */}
          {report.personality && (
            <ReportCard title="性格分析" content={report.personality.content} score={report.personality.score} />
          )}

          {/* 事业分析 */}
          {report.career && <ReportCard title="事业分析" content={report.career.content} score={report.career.score} />}

          {/* 风水建议 */}
          {report.fengshui && (
            <ReportCard title="风水建议" content={report.fengshui.content} score={report.fengshui.score} />
          )}

          {/* 财富分析 */}
          {report.wealth && <ReportCard title="财富分析" content={report.wealth.content} score={report.wealth.score} />}

          {/* 婚姻分析 */}
          {report.marriage && (
            <ReportCard title="婚姻分析" content={report.marriage.content} score={report.marriage.score} />
          )}

          {/* 健康分析 */}
          {report.health && <ReportCard title="健康分析" content={report.health.content} score={report.health.score} />}

          {/* 六亲分析 */}
          {report.family && <ReportCard title="六亲分析" content={report.family.content} score={report.family.score} />}

          {/* 底部说明 */}
          <View className="bg-card rounded-lg p-6 space-y-2">
            <Text className="text-foreground text-sm font-bold">免责声明</Text>
            <Text className="text-muted-foreground text-xs">
              本报告基于中国传统命理学理论生成，仅供参考娱乐，不构成任何决策依据。
            </Text>
            <Text className="text-muted-foreground text-xs">人生运势受多种因素影响，建议理性看待，积极进取。</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
