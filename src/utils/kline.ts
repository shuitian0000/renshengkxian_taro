import {clearCache, type DayunPeriod, generateMingliData, type KLineDataPoint} from './mingli'

export {clearCache, type DayunPeriod, generateMingliData, type KLineDataPoint}

export function generateLocalKLineData(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthTime: string,
  gender: 'male' | 'female',
  birthRegion?: string,
  calendarType: 'solar' | 'lunar' = 'solar'
): KLineDataPoint[] {
  const result = generateMingliData({
    name: '',
    birthYear,
    birthMonth,
    birthDay,
    birthTime,
    gender,
    birthRegion,
    calendarType
  })
  return result.klineData
}

export function generateDayunPeriods(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthTime: string,
  gender: 'male' | 'female',
  birthRegion?: string,
  calendarType: 'solar' | 'lunar' = 'solar'
): DayunPeriod[] {
  const result = generateMingliData({
    name: '',
    birthYear,
    birthMonth,
    birthDay,
    birthTime,
    gender,
    birthRegion,
    calendarType
  })
  return result.dayunPeriods
}

export function generateLocalReport(
  name: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthTime: string,
  gender: 'male' | 'female',
  birthRegion?: string,
  calendarType: 'solar' | 'lunar' = 'solar'
) {
  const result = generateMingliData({
    name,
    birthYear,
    birthMonth,
    birthDay,
    birthTime,
    gender,
    birthRegion,
    calendarType
  })
  return result.report
}
