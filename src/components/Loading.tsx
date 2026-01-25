import {Text, View} from '@tarojs/components'

interface LoadingProps {
  text?: string
}

/**
 * 现代化加载动画组件
 * 使用简洁的圆环旋转动画
 */
export default function Loading({text = '数据分析中'}: LoadingProps) {
  return (
    <View className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center gap-8 p-8">
      {/* 主加载动画 - 三层圆环 */}
      <View className="relative w-32 h-32">
        {/* 外圈 - 慢速旋转 */}
        <View
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          style={{
            animation: 'spin 2s linear infinite'
          }}
        />
        {/* 中圈 - 中速反向旋转 */}
        <View
          className="absolute inset-3 rounded-full border-4 border-transparent border-r-primary"
          style={{
            animation: 'spin 1.5s linear infinite reverse'
          }}
        />
        {/* 内圈 - 快速旋转 */}
        <View
          className="absolute inset-6 rounded-full border-4 border-transparent border-b-primary"
          style={{
            animation: 'spin 1s linear infinite'
          }}
        />
        {/* 中心点 - 脉动效果 */}
        <View className="absolute inset-0 flex items-center justify-center">
          <View
            className="w-8 h-8 rounded-full bg-primary"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        </View>
      </View>

      {/* 加载文字 */}
      <Text className="text-xl text-primary font-bold tracking-widest">{text}</Text>
    </View>
  )
}
