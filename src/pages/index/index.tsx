import {Button, ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import BaguaLoading from '@/components/BaguaLoading'
import BirthInfoForm, {type BirthInfoData} from '@/components/BirthInfoForm'
import FaceUpload, {type UploadFileInput} from '@/components/FaceUpload'
import {compressImage, imageToBase64, uploadFaceImage} from '@/utils/imageHelper'
import {generateDayunPeriods, generateLocalKLineData, generateLocalReport} from '@/utils/kline'

export default function Index() {
  const [birthInfo, setBirthInfo] = useState<BirthInfoData | null>(null)
  const [faceImage, setFaceImage] = useState<UploadFileInput | null>(null)
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    // 页面显示时重置状态
    setBirthInfo(null)
    setFaceImage(null)
  })

  // 处理基本信息变更
  const handleInfoChange = useCallback((data: BirthInfoData) => {
    setBirthInfo(data)
  }, [])

  // 处理面相照片上传
  const handleImageSelected = useCallback((file: UploadFileInput) => {
    setFaceImage(file)
  }, [])

  // 处理面相照片删除
  const handleImageRemove = useCallback(() => {
    setFaceImage(null)
  }, [])

  // 生成报告
  const generateReport = useCallback(async () => {
    if (!birthInfo || !birthInfo.name || !birthInfo.birthDate || !birthInfo.birthTime || !birthInfo.birthRegion) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    setLoading(true)

    try {
      let faceImageUrl: string | null = null
      let faceAnalysis: string | null = null

      // 如果有面相照片，先上传并分析
      if (faceImage) {
        // 压缩图片
        const compressedPath = await compressImage(faceImage.path, 0.8)

        // 上传到Supabase Storage
        const fileObj = faceImage.originalFileObj || ({tempFilePath: compressedPath} as unknown)
        faceImageUrl = await uploadFaceImage(fileObj, faceImage.name || `face_${Date.now()}.jpg`)

        // 转换为base64用于AI分析
        const base64Image = await imageToBase64(compressedPath)

        // 调用面相分析Edge Function
        try {
          const {data: faceData, error: faceError} = await supabase.functions.invoke('generate-face-analysis', {
            body: {imageBase64: base64Image}
          })

          if (faceError) {
            console.error('面相分析失败:', faceError)
          } else if (faceData?.analysis) {
            faceAnalysis = faceData.analysis
          }
        } catch (error) {
          console.error('面相分析异常:', error)
        }
      }

      // 调用命理报告生成Edge Function
      let klineData
      let reportData
      let dayunPeriods

      try {
        const {data: reportResult, error: reportError} = await supabase.functions.invoke('generate-destiny-report', {
          body: {
            name: birthInfo.name,
            birthDate: birthInfo.birthDate,
            birthTime: birthInfo.birthTime,
            birthRegion: birthInfo.birthRegion,
            calendarType: birthInfo.calendarType,
            faceAnalysis
          }
        })

        if (reportError) {
          throw new Error('AI服务调用失败')
        }

        klineData = reportResult.klineData
        reportData = reportResult.report
        dayunPeriods = reportResult.dayunPeriods
      } catch (error) {
        console.error('AI生成失败，使用本地算法:', error)

        // 使用本地算法生成
        const birthYear = Number.parseInt(birthInfo.birthDate.split('-')[0], 10)
        const birthMonth = Number.parseInt(birthInfo.birthDate.split('-')[1], 10)

        klineData = generateLocalKLineData(birthYear, birthMonth)
        dayunPeriods = generateDayunPeriods(birthYear)
        reportData = generateLocalReport(birthInfo.name, birthYear)
      }

      // 保存到全局状态，用于跳转到结果页
      Taro.setStorageSync('currentReport', {
        name: birthInfo.name,
        birthDate: birthInfo.birthDate,
        birthTime: birthInfo.birthTime,
        birthRegion: birthInfo.birthRegion,
        calendarType: birthInfo.calendarType,
        faceImageUrl,
        klineData,
        reportData,
        dayunPeriods
      })

      // 跳转到K线图页面
      Taro.navigateTo({url: '/pages/chart/index'})
    } catch (error) {
      console.error('生成报告失败:', error)
      Taro.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [birthInfo, faceImage])

  return (
    <View className="min-h-screen bg-gradient-dark">
      {loading && <BaguaLoading />}

      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-6 py-8">
          {/* 页面标题 */}
          <View className="text-center mb-8">
            <Text className="text-3xl font-bold gradient-text block mb-2">人生K线图</Text>
            <Text className="text-sm text-muted-foreground">天机推演 · 命理分析</Text>
          </View>

          {/* 基本信息表单 */}
          <View className="bg-card rounded-lg p-6 mb-6 shadow-elegant">
            <View className="flex items-center gap-2 mb-4">
              <View className="i-mdi-account-circle text-2xl text-primary" />
              <Text className="text-lg font-bold text-card-foreground">基本信息</Text>
            </View>
            <BirthInfoForm onChange={handleInfoChange} />
          </View>

          {/* 面相照片上传 */}
          <View className="bg-card rounded-lg p-6 mb-6 shadow-elegant">
            <View className="flex items-center gap-2 mb-4">
              <View className="i-mdi-camera text-2xl text-primary" />
              <Text className="text-lg font-bold text-card-foreground">面相照片</Text>
              <Text className="text-xs text-muted-foreground ml-auto">（可选）</Text>
            </View>
            <FaceUpload onImageSelected={handleImageSelected} onImageRemove={handleImageRemove} />
          </View>

          {/* 开始批命按钮 */}
          <Button
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg break-keep text-lg font-bold btn-press"
            size="default"
            onClick={generateReport}>
            开始批命
          </Button>

          {/* 提示信息 */}
          <View className="mt-6 text-center">
            <Text className="text-xs text-muted-foreground">* 面相照片需为正面免冠照，面部、头部、耳朵清晰可见</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
