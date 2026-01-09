import {Input, Picker, Text, View} from '@tarojs/components'
import {useEffect, useState} from 'react'
import {TIME_PERIODS} from '@/utils/lunar'
import RegionPicker from './RegionPicker'

interface BirthInfoFormProps {
  onChange?: (data: BirthInfoData) => void
  onSubmit?: (data: BirthInfoData) => void
  validationErrors?: string[]
}

export interface BirthInfoData {
  name: string
  gender: 'male' | 'female'
  birthDate: string
  birthTime: string
  birthRegion: string
  calendarType: 'solar' | 'lunar'
}

export default function BirthInfoForm({onChange, onSubmit, validationErrors = []}: BirthInfoFormProps) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthRegion, setBirthRegion] = useState('')
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')

  const hasError = (fieldName: string) => validationErrors.includes(fieldName)

  useEffect(() => {
    if (onChange) {
      onChange({name, gender, birthDate, birthTime, birthRegion, calendarType})
    }
  }, [name, gender, birthDate, birthTime, birthRegion, calendarType, onChange])

  const handleSubmit = () => {
    if (!name || !birthDate || !birthTime || !birthRegion) return
    if (onSubmit) {
      onSubmit({name, gender, birthDate, birthTime, birthRegion, calendarType})
    }
  }

  return (
    <View className="w-full space-y-6">
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">姓名</Text>
        <View
          className={`bg-input rounded px-4 py-3 ${hasError('姓名') ? 'border-2 border-destructive' : 'border border-border'}`}>
          <Input
            className="w-full text-card-foreground"
            placeholder="请输入姓名"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            style={{padding: 0, border: 'none', background: 'transparent'}}
          />
        </View>
      </View>
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">性别</Text>
        <View className="flex gap-4">
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${gender === 'male' ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
            onClick={() => setGender('male')}>
            <Text className={gender === 'male' ? 'text-primary-foreground font-bold' : 'text-card-foreground'}>男</Text>
          </View>
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${gender === 'female' ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
            onClick={() => setGender('female')}>
            <Text className={gender === 'female' ? 'text-primary-foreground font-bold' : 'text-card-foreground'}>
              女
            </Text>
          </View>
        </View>
      </View>
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">历法类型</Text>
        <View className="flex gap-4">
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${calendarType === 'solar' ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
            onClick={() => setCalendarType('solar')}>
            <Text className={calendarType === 'solar' ? 'text-primary-foreground font-bold' : 'text-card-foreground'}>
              公历
            </Text>
          </View>
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${calendarType === 'lunar' ? 'bg-primary border-primary' : 'bg-secondary border-border'}`}
            onClick={() => setCalendarType('lunar')}>
            <Text className={calendarType === 'lunar' ? 'text-primary-foreground font-bold' : 'text-card-foreground'}>
              农历
            </Text>
          </View>
        </View>
      </View>
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">出生日期</Text>
        <Picker mode="date" value={birthDate} onChange={(e) => setBirthDate(e.detail.value)}>
          <View
            className={`bg-input rounded px-4 py-3 ${hasError('出生日期') ? 'border-2 border-destructive' : 'border border-border'}`}>
            <Text className={birthDate ? 'text-card-foreground' : 'text-muted-foreground'}>
              {birthDate || '请选择出生日期'}
            </Text>
          </View>
        </Picker>
      </View>
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">出生时辰</Text>
        <Picker
          mode="selector"
          range={TIME_PERIODS.map((t) => t.label)}
          onChange={(e) => setBirthTime(TIME_PERIODS[e.detail.value].value)}>
          <View
            className={`bg-input rounded px-4 py-3 ${hasError('出生时辰') ? 'border-2 border-destructive' : 'border border-border'}`}>
            <Text className={birthTime ? 'text-card-foreground' : 'text-muted-foreground'}>
              {birthTime ? TIME_PERIODS.find((t) => t.value === birthTime)?.label : '请选择出生时辰'}
            </Text>
          </View>
        </Picker>
      </View>
      <View className="space-y-2">
        <Text className="text-card-foreground text-base font-bold">出生地区</Text>
        <View className={hasError('出生地区') ? 'border-2 border-destructive rounded' : ''}>
          <RegionPicker value={birthRegion} onChange={setBirthRegion} />
        </View>
      </View>
      {onSubmit && (
        <View
          className={`w-full py-4 rounded text-center btn-press ${name && birthDate && birthTime && birthRegion ? 'bg-primary' : 'bg-muted'}`}
          onClick={handleSubmit}>
          <Text
            className={
              name && birthDate && birthTime && birthRegion
                ? 'text-primary-foreground font-bold'
                : 'text-muted-foreground'
            }>
            下一步
          </Text>
        </View>
      )}
    </View>
  )
}
