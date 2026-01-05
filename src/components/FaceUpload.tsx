import {Button, Image, Text, View} from '@tarojs/components'
import {useState} from 'react'
import {chooseImageFile, type UploadFileInput} from '@/utils/imageHelper'

export type {UploadFileInput}

interface FaceUploadProps {
  onImageSelected: (file: UploadFileInput) => void
  onImageRemove?: () => void
}

export default function FaceUpload({onImageSelected, onImageRemove}: FaceUploadProps) {
  const [selectedImage, setSelectedImage] = useState<UploadFileInput | null>(null)

  const handleChooseImage = async () => {
    const file = await chooseImageFile()
    if (file) {
      setSelectedImage(file)
      onImageSelected(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (onImageRemove) {
      onImageRemove()
    }
  }

  return (
    <View className="w-full">
      {!selectedImage ? (
        <View className="space-y-4">
          <Text className="text-card-foreground text-sm">
            上传正面免冠照片，面部、头部、耳朵清晰可见，可提升分析准确度
          </Text>
          <Button
            className="w-full bg-secondary text-secondary-foreground py-3 rounded break-keep text-base"
            size="default"
            onClick={handleChooseImage}>
            选择照片
          </Button>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="w-full h-64 bg-input rounded overflow-hidden flex items-center justify-center">
            <Image src={selectedImage.path} mode="aspectFit" className="w-full h-full" />
          </View>
          <View className="flex gap-4">
            <Button
              className="flex-1 bg-muted text-muted-foreground py-3 rounded break-keep text-base"
              size="default"
              onClick={handleRemoveImage}>
              重新选择
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground py-3 rounded break-keep text-base"
              size="default"
              onClick={handleRemoveImage}>
              清空照片
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}
