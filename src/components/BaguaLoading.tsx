import {Text, View} from '@tarojs/components'

interface BaguaLoadingProps {
  text?: string
}

export default function BaguaLoading({text = '天机推算中'}: BaguaLoadingProps) {
  return (
    <View className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* 八卦图 */}
      <View className="relative w-32 h-32 mb-8">
        {/* 外圈 - 八卦符号 */}
        <View className="absolute inset-0 animate-bagua">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* 八卦外圈 */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />

            {/* 八个卦象位置的标记 */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
              const radian = (angle * Math.PI) / 180
              const x = 50 + 40 * Math.cos(radian - Math.PI / 2)
              const y = 50 + 40 * Math.sin(radian - Math.PI / 2)
              return <circle key={index} cx={x} cy={y} r="3" fill="hsl(var(--primary))" />
            })}

            {/* 中心太极图 */}
            <circle cx="50" cy="50" r="20" fill="hsl(var(--primary))" />
            <path
              d="M 50 30 A 10 10 0 0 1 50 50 A 10 10 0 0 0 50 70 A 20 20 0 0 1 50 30"
              fill="hsl(var(--background))"
            />
            <circle cx="50" cy="40" r="3" fill="hsl(var(--background))" />
            <circle cx="50" cy="60" r="3" fill="hsl(var(--primary))" />
          </svg>
        </View>

        {/* 内圈光晕 */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View className="w-24 h-24 rounded-full bg-primary/10 animate-pulse" />
        </View>
      </View>

      {/* 加载文字 */}
      <Text className="text-xl text-primary font-bold tracking-widest">{text}</Text>

      {/* 副标题 */}
      <Text className="text-sm text-muted-foreground mt-2">请稍候...</Text>
    </View>
  )
}
