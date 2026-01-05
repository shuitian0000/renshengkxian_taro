import {Input, Picker, Text, View} from '@tarojs/components'
import {useState} from 'react'
import {TIME_PERIODS} from '@/utils/lunar'

interface BirthInfoFormProps {
  onSubmit: (data: BirthInfoData) => void
}

export interface BirthInfoData {
  name: string
  birthDate: string
  birthTime: string
  birthRegion: string
  calendarType: 'solar' | 'lunar'
}

export default function BirthInfoForm({onSubmit}: BirthInfoFormProps) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthRegion, setBirthRegion] = useState('')
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')

  const handleSubmit = () => {
    if (!name || !birthDate || !birthTime || !birthRegion) {
      return
    }
    onSubmit({
      name,
      birthDate,
      birthTime,
      birthRegion,
      calendarType
    })
  }

  return (
    <View className="w-full space-y-6">
      {/* 姓名 */}
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">姓名</Text>
        <View className="bg-input rounded border border-border px-4 py-3">
          <Input
            className="w-full text-foreground"
            placeholder="请输入姓名"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            style={{padding: 0, border: 'none', background: 'transparent'}}
          />
        </View>
      </View>

      {/* 历法类型 */}
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">历法类型</Text>
        <View className="flex gap-4">
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${
              calendarType === 'solar' ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
            onClick={() => setCalendarType('solar')}>
            <Text className={calendarType === 'solar' ? 'text-primary-foreground' : 'text-foreground'}>公历</Text>
          </View>
          <View
            className={`flex-1 py-3 rounded border text-center btn-press ${
              calendarType === 'lunar' ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
            onClick={() => setCalendarType('lunar')}>
            <Text className={calendarType === 'lunar' ? 'text-primary-foreground' : 'text-foreground'}>农历</Text>
          </View>
        </View>
      </View>

      {/* 出生日期 */}
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">出生日期</Text>
        <Picker mode="date" value={birthDate} onChange={(e) => setBirthDate(e.detail.value)}>
          <View className="bg-input rounded border border-border px-4 py-3">
            <Text className={birthDate ? 'text-foreground' : 'text-muted-foreground'}>
              {birthDate || '请选择出生日期'}
            </Text>
          </View>
        </Picker>
      </View>

      {/* 出生时辰 */}
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">出生时辰</Text>
        <Picker
          mode="selector"
          range={TIME_PERIODS.map((t) => t.label)}
          onChange={(e) => setBirthTime(TIME_PERIODS[e.detail.value].value)}>
          <View className="bg-input rounded border border-border px-4 py-3">
            <Text className={birthTime ? 'text-foreground' : 'text-muted-foreground'}>
              {birthTime ? TIME_PERIODS.find((t) => t.value === birthTime)?.label : '请选择出生时辰'}
            </Text>
          </View>
        </Picker>
      </View>

      {/* 出生地区 */}
      <View className="space-y-2">
        <Text className="text-foreground text-base font-bold">出生地区</Text>
        <View className="bg-input rounded border border-border px-4 py-3">
          <Input
            className="w-full text-foreground"
            placeholder="请输入出生地区（精确到地级市）"
            value={birthRegion}
            onInput={(e) => setBirthRegion(e.detail.value)}
            style={{padding: 0, border: 'none', background: 'transparent'}}
          />
        </View>
      </View>

      {/* 提交按钮 */}
      <View
        className={`w-full py-4 rounded text-center btn-press ${
          name && birthDate && birthTime && birthRegion ? 'bg-primary' : 'bg-muted'
        }`}
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
    </View>
  )
}
