import {Text, View} from '@tarojs/components'

interface ReportCardProps {
  title: string
  content: string
  score: number
}

export default function ReportCard({title, content, score}: ReportCardProps) {
  // 根据评分显示不同颜色
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-primary'
    if (score >= 6) return 'text-foreground'
    return 'text-destructive'
  }

  return (
    <View className="bg-gradient-card rounded-lg p-6 space-y-4 shadow-elegant">
      {/* 标题和评分 */}
      <View className="flex items-center justify-between">
        <Text className="text-foreground text-lg font-bold">{title}</Text>
        <View className="flex items-center gap-2">
          <Text className={`text-2xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</Text>
          <Text className="text-muted-foreground text-sm">分</Text>
        </View>
      </View>

      {/* 分隔线 */}
      <View className="w-full h-px bg-border" />

      {/* 内容 */}
      <Text className="text-foreground text-sm leading-relaxed">{content}</Text>
    </View>
  )
}
