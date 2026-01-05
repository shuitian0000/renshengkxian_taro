// 公历农历转换工具
import {Lunar, Solar} from 'lunar-javascript'

/**
 * 公历转农历
 */
export function solarToLunar(year: number, month: number, day: number) {
  const solar = Solar.fromYmd(year, month, day)
  const lunar = solar.getLunar()

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    monthChinese: lunar.getMonthInChinese(),
    dayChinese: lunar.getDayInChinese(),
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi()
  }
}

/**
 * 农历转公历
 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth = false) {
  const lunar = Lunar.fromYmd(year, month, day, 0, isLeapMonth)
  const solar = lunar.getSolar()

  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay()
  }
}

/**
 * 获取八字信息
 */
export function getBaZi(year: number, month: number, day: number, hour: number) {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
  const lunar = solar.getLunar()
  const baZi = lunar.getEightChar()

  return {
    year: baZi.getYear(),
    month: baZi.getMonth(),
    day: baZi.getDay(),
    hour: baZi.getTime(),
    yearGanZhi: baZi.getYearInGanZhi(),
    monthGanZhi: baZi.getMonthInGanZhi(),
    dayGanZhi: baZi.getDayInGanZhi(),
    hourGanZhi: baZi.getTimeInGanZhi()
  }
}

/**
 * 时辰列表
 */
export const TIME_PERIODS = [
  {value: '23-01', label: '子时 (23:00-01:00)', hour: 0},
  {value: '01-03', label: '丑时 (01:00-03:00)', hour: 1},
  {value: '03-05', label: '寅时 (03:00-05:00)', hour: 3},
  {value: '05-07', label: '卯时 (05:00-07:00)', hour: 5},
  {value: '07-09', label: '辰时 (07:00-09:00)', hour: 7},
  {value: '09-11', label: '巳时 (09:00-11:00)', hour: 9},
  {value: '11-13', label: '午时 (11:00-13:00)', hour: 11},
  {value: '13-15', label: '未时 (13:00-15:00)', hour: 13},
  {value: '15-17', label: '申时 (15:00-17:00)', hour: 15},
  {value: '17-19', label: '酉时 (17:00-19:00)', hour: 17},
  {value: '19-21', label: '戌时 (19:00-21:00)', hour: 19},
  {value: '21-23', label: '亥时 (21:00-23:00)', hour: 21}
]
