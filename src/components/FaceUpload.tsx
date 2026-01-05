import {Button, Image, Text, View} from '@tarojs/components'
import {useState} from 'react'
import {chooseImageFile, type UploadFileInput} from '@/utils/imageHelper'

interface FaceUploadProps {
  onImageSelected: (file: UploadFileInput) => void
  onSkip: () => void
}

export default function FaceUpload({onImageSelected, onSkip}: FaceUploadProps) {
  const [selectedImage, setSelectedImage] = useState<UploadFileInput | null>(null)

  const handleChooseImage = async () => {
    const file = await chooseImageFile()
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleConfirm = () => {
    if (selectedImage) {
      onImageSelected(selectedImage)
    }
  }

  return (
    <View className="w-full space-y-6">
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">面相照片（可选）</Text>
        <Text className="text-muted-foreground text-sm">
          上传正面免冠照片，面部、头部、耳朵清晰可见，有助于提升命理分析准确度
        </Text>
      </View>

      {/* 图片预览 */}
      {selectedImage ? (
        <View className="w-full aspect-square bg-card rounded border border-border overflow-hidden">
          <Image src={selectedImage.path} mode="aspectFit" className="w-full h-full" />
        </View>
      ) : (
        <View
          className="w-full aspect-square bg-card rounded border-2 border-dashed border-border flex flex-col items-center justify-center btn-press"
          onClick={handleChooseImage}>
          <View className="i-mdi-camera text-6xl text-muted-foreground mb-4" />
          <Text className="text-muted-foreground">点击上传照片</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View className="flex gap-4">
        <View className="flex-1 py-4 rounded text-center border border-border btn-press" onClick={onSkip}>
          <Text className="text-foreground">跳过</Text>
        </View>
        {selectedImage ? (
          <View className="flex-1 py-4 rounded text-center bg-primary btn-press" onClick={handleConfirm}>
            <Text className="text-primary-foreground font-bold">确认</Text>
          </View>
        ) : (
          <Button
            className="flex-1 py-4 rounded text-center bg-primary text-primary-foreground font-bold"
            size="default"
            openType="chooseAvatar"
            onChooseAvatar={(e) => {
              const avatarUrl = e.detail.avatarUrl
              setSelectedImage({
                path: avatarUrl,
                size: 0,
                name: `face_${Date.now()}.jpg`
              })
            }}>
            <Text className="text-primary-foreground font-bold">选择照片</Text>
          </Button>
        )}
      </View>

      {/* 提示信息 */}
      <View className="bg-card rounded p-4 space-y-2">
        <Text className="text-foreground text-sm font-bold">照片要求：</Text>
        <Text className="text-muted-foreground text-xs">1. 正面免冠照片</Text>
        <Text className="text-muted-foreground text-xs">2. 面部、头部、耳朵清晰可见</Text>
        <Text className="text-muted-foreground text-xs">3. 光线充足，无遮挡</Text>
        <Text className="text-muted-foreground text-xs">4. 支持JPG、PNG、WEBP格式</Text>
      </View>
    </View>
  )
}
