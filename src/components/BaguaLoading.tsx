import {Text, View} from '@tarojs/components'

interface BaguaLoadingProps {
  text?: string
}

export default function BaguaLoading({text = '天机推算中'}: BaguaLoadingProps) {
  return (
    <View className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* 八卦图 - 使用纯CSS实现 */}
      <View className="relative w-32 h-32 mb-8">
        {/* 外圈旋转 */}
        <View className="absolute inset-0 animate-bagua">
          <View className="w-full h-full rounded-full border-2 border-primary relative">
            {/* 八个卦象位置的标记点 */}
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '0%', left: '50%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '15%', left: '85%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '50%', left: '100%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '85%', left: '85%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '100%', left: '50%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '85%', left: '15%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '50%', left: '0%', transform: 'translate(-50%, -50%)'}}
            />
            <View
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{top: '15%', left: '15%', transform: 'translate(-50%, -50%)'}}
            />
          </View>
        </View>

        {/* 中心太极图 */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View className="w-16 h-16 rounded-full bg-primary relative overflow-hidden">
            {/* 阴阳分界 */}
            <View className="absolute top-0 left-0 w-full h-1/2 bg-background rounded-t-full" />
            <View className="absolute top-1/4 left-1/4 w-2 h-2 bg-background rounded-full" />
            <View
              className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-primary rounded-full"
              style={{backgroundColor: 'hsl(var(--background))'}}
            />
          </View>
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
