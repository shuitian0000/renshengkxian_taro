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
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useDidShow(() => {
    setBirthInfo(null)
    setFaceImage(null)
    setValidationErrors([])
  })

  const handleInfoChange = useCallback((data: BirthInfoData) => {
    setBirthInfo(data)
    setValidationErrors([])
  }, [])

  const handleImageSelected = useCallback((file: UploadFileInput) => {
    setFaceImage(file)
  }, [])

  const handleImageRemove = useCallback(() => {
    setFaceImage(null)
  }, [])

  const generateReport = useCallback(async () => {
    const errors: string[] = []
    if (!birthInfo?.name) errors.push('姓名')
    if (!birthInfo?.birthDate) errors.push('出生日期')
    if (!birthInfo?.birthTime) errors.push('出生时辰')
    if (!birthInfo?.birthRegion) errors.push('出生地区')

    if (errors.length > 0) {
      setValidationErrors(errors)
      Taro.showToast({title: `请填写：${errors.join('、')}`, icon: 'none', duration: 2500})
      return
    }

    if (!birthInfo) return

    setLoading(true)

    try {
      let faceImageUrl: string | null = null
      let faceAnalysis: string | null = null

      if (faceImage) {
        try {
          const compressedPath = await compressImage(faceImage.path, 0.8)
          const fileObj = faceImage.originalFileObj || ({tempFilePath: compressedPath} as unknown)
          faceImageUrl = await uploadFaceImage(fileObj, faceImage.name || `face_${Date.now()}.jpg`)
          const base64Image = await imageToBase64(compressedPath)
          const {data: faceData, error: faceError} = await supabase.functions.invoke('generate-face-analysis', {
            body: {imageBase64: base64Image}
          })
          if (faceError) {
            console.error('面相分析失败:', faceError)
          } else if (faceData?.analysis) {
            faceAnalysis = faceData.analysis
          }
        } catch (error) {
          console.error('面相照片处理失败，跳过面相分析:', error)
        }
      }

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
        if (reportError) throw new Error('AI服务调用失败')
        klineData = reportResult.klineData
        reportData = reportResult.report
        dayunPeriods = reportResult.dayunPeriods
      } catch (error) {
        console.error('AI生成失败，使用本地算法:', error)
        const birthYear = Number.parseInt(birthInfo.birthDate.split('-')[0], 10)
        const birthMonth = Number.parseInt(birthInfo.birthDate.split('-')[1], 10)
        klineData = generateLocalKLineData(birthYear, birthMonth)
        dayunPeriods = generateDayunPeriods(birthYear)
        reportData = generateLocalReport(birthInfo.name, birthYear)
      }

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
      Taro.navigateTo({url: '/pages/chart/index'})
    } catch (error) {
      console.error('生成报告失败:', error)
      Taro.showToast({title: '生成失败，请重试', icon: 'none'})
    } finally {
      setLoading(false)
    }
  }, [birthInfo, faceImage])

  return (
    <View className="min-h-screen bg-gradient-dark">
      {loading && <BaguaLoading />}
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-6 py-8">
          <View className="text-center mb-8">
            <Text className="text-3xl font-bold gradient-text block mb-2">人生K线图谱</Text>
            <Text className="text-sm text-muted-foreground">天机推演 · 命理分析</Text>
          </View>
          <View className="bg-card rounded-lg p-6 mb-6 shadow-elegant">
            <View className="flex items-center gap-2 mb-4">
              <View className="i-mdi-account-circle text-2xl text-primary" />
              <Text className="text-lg font-bold text-card-foreground">基本信息</Text>
            </View>
            <BirthInfoForm onChange={handleInfoChange} validationErrors={validationErrors} />
          </View>
          <View className="bg-card rounded-lg p-6 mb-6 shadow-elegant">
            <View className="flex items-center gap-2 mb-4">
              <View className="i-mdi-camera text-2xl text-primary" />
              <Text className="text-lg font-bold text-card-foreground">面相照片</Text>
              <Text className="text-xs text-muted-foreground ml-auto">（可选）</Text>
            </View>
            <FaceUpload onImageSelected={handleImageSelected} onImageRemove={handleImageRemove} />
          </View>
          <Button
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg break-keep text-lg font-bold btn-press"
            size="default"
            onClick={generateReport}>
            开始批命
          </Button>
          <View className="mt-6 text-center">
            <Text className="text-xs text-muted-foreground">* 面相照片为可选项，不影响命理分析</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
