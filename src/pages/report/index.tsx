import {Button, ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import ReportCard from '@/components/ReportCard'
import {generateAndSavePDF} from '@/utils/pdfGenerator'

export default function Report() {
  const [reportData, setReportData] = useState<any>(null)

  useDidShow(() => {
    const data = Taro.getStorageSync('currentReport')
    if (data) {
      setReportData(data)
    } else {
      Taro.showToast({title: '数据加载失败', icon: 'none'})
      setTimeout(() => {
        Taro.switchTab({url: '/pages/index/index'})
      }, 1500)
    }
  })

  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!reportData) {
      Taro.showToast({title: '数据加载中...', icon: 'none'})
      return
    }

    await generateAndSavePDF({
      name: reportData.name,
      birthDate: reportData.birthDate,
      birthTime: reportData.birthTime,
      birthRegion: reportData.birthRegion,
      klineData: reportData.klineData,
      reportData: reportData.reportData
    })
  }, [reportData])

  if (!reportData) {
    return (
      <View className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Text className="text-muted-foreground">加载中...</Text>
      </View>
    )
  }

  const report = reportData.reportData

  return (
    <View className="min-h-screen bg-gradient-dark">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-8 py-8 space-y-6">
          <View className="text-center space-y-2">
            <Text className="text-2xl font-bold gradient-text block">{reportData.name}的命理报告</Text>
            <Text className="text-muted-foreground text-sm block">
              {reportData.birthDate} {reportData.birthTime}
            </Text>
          </View>

          {report.summary && (
            <ReportCard title="命理总评" content={report.summary.content} score={report.summary.score} />
          )}

          {report.personality && (
            <ReportCard title="性格分析" content={report.personality.content} score={report.personality.score} />
          )}

          {report.career && <ReportCard title="事业分析" content={report.career.content} score={report.career.score} />}

          {report.fengshui && (
            <ReportCard title="风水建议" content={report.fengshui.content} score={report.fengshui.score} />
          )}

          {report.wealth && <ReportCard title="财富分析" content={report.wealth.content} score={report.wealth.score} />}

          {report.marriage && (
            <ReportCard title="婚姻分析" content={report.marriage.content} score={report.marriage.score} />
          )}

          {report.health && <ReportCard title="健康分析" content={report.health.content} score={report.health.score} />}

          {report.family && <ReportCard title="六亲分析" content={report.family.content} score={report.family.score} />}

          <View className="bg-card rounded-lg p-6 space-y-2">
            <Text className="text-card-foreground text-sm font-bold">免责声明</Text>
            <Text className="text-muted-foreground text-xs">
              本报告基于中国传统命理学理论生成，仅供参考娱乐，不构成任何决策依据。
            </Text>
            <Text className="text-muted-foreground text-xs">人生运势受多种因素影响，建议理性看待，积极进取。</Text>
          </View>

          <Button
            className="w-full py-4 rounded-lg bg-accent text-accent-foreground break-keep text-base btn-press"
            size="default"
            onClick={handleDownload}>
            下载报告长图
          </Button>

          <Button
            className="w-full py-4 rounded-lg border border-border bg-card text-card-foreground break-keep text-base font-bold btn-press"
            size="default"
            onClick={handleBack}>
            返回K线图
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}
