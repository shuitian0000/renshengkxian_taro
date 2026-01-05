import {ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'
import {supabase} from '@/client/supabase'
import BirthInfoForm, {type BirthInfoData} from '@/components/BirthInfoForm'
import FaceUpload from '@/components/FaceUpload'
import {uploadFaceImage} from '@/db/api'
import {compressImage, imageToBase64, type UploadFileInput} from '@/utils/imageHelper'
import {generateDayunPeriods, generateLocalKLineData, generateLocalReport} from '@/utils/kline'

export default function Index() {
  const [step, setStep] = useState<'info' | 'face'>('info')
  const [birthInfo, setBirthInfo] = useState<BirthInfoData | null>(null)
  const [_loading, setLoading] = useState(false)

  useDidShow(() => {
    // 页面显示时重置状态
    setStep('info')
    setBirthInfo(null)
  })

  // 处理基本信息提交
  const handleInfoSubmit = useCallback((data: BirthInfoData) => {
    setBirthInfo(data)
    setStep('face')
  }, [])

  // 处理面相照片上传
  const handleImageSelected = useCallback(
    async (file: UploadFileInput) => {
      if (!birthInfo) return
      await generateReport(file)
    },
    [birthInfo, generateReport]
  )

  // 跳过面相上传
  const handleSkip = useCallback(async () => {
    if (!birthInfo) return
    await generateReport(null)
  }, [birthInfo, generateReport])

  // 生成报告
  const generateReport = useCallback(
    async (faceFile: UploadFileInput | null) => {
      if (!birthInfo) return

      setLoading(true)
      Taro.showLoading({title: '生成中...', mask: true})

      try {
        let faceImageUrl: string | null = null
        let faceAnalysis: string | null = null

        // 如果有面相照片，先上传并分析
        if (faceFile) {
          // 压缩图片
          const compressedPath = await compressImage(faceFile.path, 0.8)

          // 上传到Supabase Storage
          const fileObj = faceFile.originalFileObj || ({tempFilePath: compressedPath} as any)
          faceImageUrl = await uploadFaceImage(fileObj, faceFile.name || `face_${Date.now()}.jpg`)

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
        let klineData: any
        let reportData: any
        let dayunPeriods: any

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

        Taro.hideLoading()

        // 跳转到K线图页面
        Taro.navigateTo({url: '/pages/chart/index'})
      } catch (error) {
        console.error('生成报告失败:', error)
        Taro.hideLoading()
        Taro.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        })
      } finally {
        setLoading(false)
      }
    },
    [birthInfo]
  )

  return (
    <View className="min-h-screen bg-background">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="px-8 py-12 space-y-8">
          {/* 标题 */}
          <View className="text-center space-y-4">
            <Text className="text-3xl font-bold gradient-text block">人生K线图</Text>
            <Text className="text-muted-foreground text-sm block">基于传统命理，洞察人生运势</Text>
          </View>

          {/* 步骤指示器 */}
          <View className="flex items-center justify-center gap-4">
            <View className="flex items-center gap-2">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={step === 'info' ? 'text-primary-foreground text-sm' : 'text-muted-foreground text-sm'}>
                  1
                </Text>
              </View>
              <Text className={step === 'info' ? 'text-foreground text-sm' : 'text-muted-foreground text-sm'}>
                基本信息
              </Text>
            </View>
            <View className="w-12 h-px bg-border" />
            <View className="flex items-center gap-2">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'face' ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={step === 'face' ? 'text-primary-foreground text-sm' : 'text-muted-foreground text-sm'}>
                  2
                </Text>
              </View>
              <Text className={step === 'face' ? 'text-foreground text-sm' : 'text-muted-foreground text-sm'}>
                面相照片
              </Text>
            </View>
          </View>

          {/* 表单内容 */}
          <View className="bg-card rounded-lg p-6 shadow-elegant">
            {step === 'info' && <BirthInfoForm onSubmit={handleInfoSubmit} />}
            {step === 'face' && <FaceUpload onImageSelected={handleImageSelected} onSkip={handleSkip} />}
          </View>

          {/* 说明 */}
          <View className="bg-card rounded-lg p-6 space-y-2">
            <Text className="text-foreground text-sm font-bold">温馨提示</Text>
            <Text className="text-muted-foreground text-xs">
              本应用基于中国传统命理学理论，综合运用八字命理、易经占卜、阴阳五行等多种方法进行分析。
            </Text>
            <Text className="text-muted-foreground text-xs">生成的报告仅供参考，不构成任何决策依据。</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
