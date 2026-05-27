import {Lunar, Solar} from 'lunar-javascript'

export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export type TianGan = (typeof TIANGAN)[number]
export type DiZhi = (typeof DIZHI)[number]
export type WuXing = '木' | '火' | '土' | '金' | '水'

export const WUXING: Record<TianGan, WuXing> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水'
}

export const WUXING_ORDER = ['木', '火', '土', '金', '水']

export const WUXING_SHENG: Record<string, string> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木'
}

export const WUXING_KE: Record<string, string> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木'
}

export const WUXING_SHENG_REVERSE: Record<string, string> = {
  火: '木',
  土: '火',
  金: '土',
  水: '金',
  木: '水'
}

export const WUXING_KE_REVERSE: Record<string, string> = {
  土: '木',
  水: '土',
  火: '水',
  金: '火',
  木: '金'
}

function _getWuxing(gan: TianGan): WuXing {
  return WUXING[gan]
}

export function tryGetWuxing(gan: string): string {
  if (isValidTianGan(gan)) {
    return WUXING[gan]
  }
  return ''
}

export interface BaZiPillar {
  gan: string
  zhi: string
  ganZhi: string
  wuxing: string
}

export interface BaZiChart {
  yearPillar: BaZiPillar
  monthPillar: BaZiPillar
  dayPillar: BaZiPillar
  hourPillar: BaZiPillar
  dayMasterGan: string
  dayMasterWuxing: string
  dayMasterGanIndex: number
}

export interface TenShenItem {
  pillar: string
  stem: string
  tenShen: string
  wuxing: string
  relation: string
}

export interface TenShenAnalysis {
  items: TenShenItem[]
  officialStar: string[]
  wealthStar: string[]
  printStar: string[]
  foodStar: string[]
  harmStar: string[]
  resourceStar: string[]
  biJian: string[]
  jieCai: string[]
}

export interface DayMasterStrength {
  level: '极强' | '强' | '中' | '弱' | '极弱'
  score: number
  detail: {
    lingScore: number
    diScore: number
    shiScore: number
  }
  description: string
  yongShen: string
  jiShen: string
}

export interface WuXingBalance {
  wuxingScores: Record<string, number>
  excess: string[]
  lacking: string
  balanceAdvice: string
}

function getGanIndex(gan: string): number {
  return TIANGAN.indexOf(gan) ?? -1
}

function getZhiIndex(zhi: string): number {
  return DIZHI.indexOf(zhi) ?? -1
}

function getZhiWuxing(zhi: string): string {
  const map: Record<string, string> = {
    子: '水',
    丑: '土',
    寅: '木',
    卯: '木',
    辰: '土',
    巳: '火',
    午: '火',
    未: '土',
    申: '金',
    酉: '金',
    戌: '土',
    亥: '水'
  }
  return map[zhi] || ''
}

function getZhiCangGan(zhi: string): string[] {
  const map: Record<string, string[]> = {
    子: ['癸'],
    丑: ['己', '癸', '辛'],
    寅: ['甲', '丙', '戊'],
    卯: ['乙'],
    辰: ['戊', '乙', '癸'],
    巳: ['丙', '戊', '庚'],
    午: ['丁', '己'],
    未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'],
    酉: ['辛'],
    戌: ['戊', '辛', '丁'],
    亥: ['壬', '甲']
  }
  return map[zhi] || []
}

function isYinStar(gan: string, dayMasterGan: string): boolean {
  const yinMap: Record<string, string> = {
    甲: '壬癸',
    乙: '壬癸',
    丙: '甲乙',
    丁: '甲乙',
    戊: '丙丁',
    己: '丙丁',
    庚: '戊己',
    辛: '戊己',
    壬: '庚辛',
    癸: '庚辛'
  }
  return yinMap[dayMasterGan]?.includes(gan) || false
}

function isBiStar(gan: string, dayMasterGan: string): boolean {
  return gan === dayMasterGan
}

function isCaiStar(gan: string, dayMasterGan: string): boolean {
  const caiMap: Record<string, string> = {
    甲: '戊己',
    乙: '戊己',
    丙: '庚辛',
    丁: '庚辛',
    戊: '壬癸',
    己: '壬癸',
    庚: '甲乙',
    辛: '甲乙',
    壬: '丙丁',
    癸: '丙丁'
  }
  return caiMap[dayMasterGan]?.includes(gan) || false
}

function isGuanStar(gan: string, dayMasterGan: string): boolean {
  const guanMap: Record<string, string> = {
    甲: '庚辛',
    乙: '庚辛',
    丙: '壬癸',
    丁: '壬癸',
    戊: '甲乙',
    己: '甲乙',
    庚: '丙丁',
    辛: '丙丁',
    壬: '戊己',
    癸: '戊己'
  }
  return guanMap[dayMasterGan]?.includes(gan) || false
}

function isShiStar(gan: string, dayMasterGan: string): boolean {
  const shiMap: Record<string, string> = {
    甲: '丙丁',
    乙: '丙丁',
    丙: '戊己',
    丁: '戊己',
    戊: '庚辛',
    己: '庚辛',
    庚: '壬癸',
    辛: '壬癸',
    壬: '甲乙',
    癸: '甲乙'
  }
  return shiMap[dayMasterGan]?.includes(gan) || false
}

function isShangStar(gan: string, dayMasterGan: string): boolean {
  const shengMap: Record<string, string> = {
    甲: '丁',
    乙: '丙',
    丙: '己',
    丁: '戊',
    戊: '辛',
    己: '庚',
    庚: '癸',
    辛: '壬',
    壬: '乙',
    癸: '甲'
  }
  return shengMap[dayMasterGan]?.includes(gan) || false
}

export function getTenShen(gan: string, dayMasterGan: string): string {
  if (gan === dayMasterGan) return '日主'
  if (isYinStar(gan, dayMasterGan)) return '正印'
  if (isShiStar(gan, dayMasterGan)) return '食神'
  if (isCaiStar(gan, dayMasterGan)) return '正财'
  if (isGuanStar(gan, dayMasterGan)) return '正官'
  if (isBiStar(gan, dayMasterGan)) return '比肩'
  if (isShangStar(gan, dayMasterGan)) return '伤官'
  if (isYinStar(gan.replace('正', '偏') || '', dayMasterGan)) return '偏印'
  if (isCaiStar(gan.replace('正', '偏') || '', dayMasterGan)) return '偏财'
  if (isGuanStar(gan.replace('正', '偏') || '', dayMasterGan)) return '七杀'
  return '未知'
}

export function getTenShenDetail(gan: string, pillar: string, dayMasterGan: string): TenShenItem {
  const tenShen = getTenShen(gan, dayMasterGan)
  const wuxing = tryGetWuxing(gan)

  let relation = '同类'
  const dayMasterWuxing = tryGetWuxing(dayMasterGan)
  if (WUXING_SHENG[dayMasterWuxing] === wuxing) relation = '相生'
  else if (WUXING_KE[dayMasterWuxing] === wuxing) relation = '相克'
  else if (wuxing === dayMasterWuxing) relation = '同类'

  return {pillar, stem: gan, tenShen, wuxing, relation}
}

const _DIZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function parseHourToZhi(hour: number): string {
  const index = Math.floor((hour + 1) / 2) % 12
  return _DIZHI_ORDER[index]
}

function isValidTianGan(gan: string): gan is TianGan {
  return TIANGAN.includes(gan as TianGan)
}

function _isValidDiZhi(zhi: string): zhi is DiZhi {
  return DIZHI.includes(zhi as DiZhi)
}

function getWuxingFromGan(gan: string): string {
  if (!isValidTianGan(gan)) return ''
  return WUXING[gan]
}

function validateSolarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function validateLunarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 30) return false

  try {
    const lunar = Lunar.fromYmd(year, month, day)
    return lunar.getYear() === year && lunar.getMonth() === month && lunar.getDay() === day
  } catch {
    return false
  }
}

export function getBaZiChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  calendarType: 'solar' | 'lunar' = 'solar'
): BaZiChart {
  const safeYear = Math.max(1900, Math.min(2100, year))
  const safeMonth = Math.max(1, Math.min(12, month))
  const safeHour = Math.max(0, Math.min(23, hour))

  let safeDay = day
  let validDate = false
  let usedCalendarType: 'solar' | 'lunar' = calendarType

  if (calendarType === 'solar') {
    validDate = validateSolarDate(safeYear, safeMonth, safeDay)
    if (!validDate) {
      safeDay = Math.max(1, Math.min(28, day))
      validDate = validateSolarDate(safeYear, safeMonth, safeDay)
    }
  } else {
    validDate = validateLunarDate(safeYear, safeMonth, safeDay)
    if (!validDate) {
      safeDay = Math.max(1, Math.min(29, day))
      validDate = validateLunarDate(safeYear, safeMonth, safeDay)
    }
    if (!validDate) {
      validDate = validateSolarDate(safeYear, safeMonth, safeDay)
      if (validDate) usedCalendarType = 'solar'
    }
  }

  let lunar: Lunar
  try {
    if (usedCalendarType === 'lunar') {
      lunar = Lunar.fromYmd(safeYear, safeMonth, safeDay)
    } else {
      const solar = Solar.fromYmdHms(safeYear, safeMonth, safeDay, safeHour, 0, 0)
      lunar = solar.getLunar()
    }
  } catch {
    const fallbackSolar = Solar.fromYmdHms(safeYear, safeMonth, 1, safeHour, 0, 0)
    lunar = fallbackSolar.getLunar()
  }

  const baZi = lunar.getEightChar()

  const yearGan = baZi.getYear().slice(0, 1)
  const yearZhi = baZi.getYear().slice(1)
  const monthGan = baZi.getMonth().slice(0, 1)
  const monthZhi = baZi.getMonth().slice(1)
  const dayGan = baZi.getDay().slice(0, 1)
  const dayZhi = baZi.getDay().slice(1)
  const hourZhi = baZi.getTime().slice(1)
  const hourGan = baZi.getTime().slice(0, 1)

  return {
    yearPillar: {
      gan: yearGan,
      zhi: yearZhi,
      ganZhi: `${yearGan}${yearZhi}`,
      wuxing: getWuxingFromGan(yearGan)
    },
    monthPillar: {
      gan: monthGan,
      zhi: monthZhi,
      ganZhi: `${monthGan}${monthZhi}`,
      wuxing: getWuxingFromGan(monthGan)
    },
    dayPillar: {
      gan: dayGan,
      zhi: dayZhi,
      ganZhi: `${dayGan}${dayZhi}`,
      wuxing: getWuxingFromGan(dayGan)
    },
    hourPillar: {
      gan: hourGan,
      zhi: hourZhi,
      ganZhi: `${hourGan}${hourZhi}`,
      wuxing: getWuxingFromGan(hourGan)
    },
    dayMasterGan: dayGan,
    dayMasterWuxing: getWuxingFromGan(dayGan),
    dayMasterGanIndex: getGanIndex(dayGan)
  }
}

export function analyzeTenShen(chart: BaZiChart): TenShenAnalysis {
  const allStems = [
    {pillar: '年柱', stem: chart.yearPillar.gan},
    {pillar: '月柱', stem: chart.monthPillar.gan},
    {pillar: '日柱', stem: chart.dayPillar.gan},
    {pillar: '时柱', stem: chart.hourPillar.gan}
  ]

  const items = allStems.map((item) => getTenShenDetail(item.stem, item.pillar, chart.dayMasterGan))

  const officialStar: string[] = []
  const wealthStar: string[] = []
  const printStar: string[] = []
  const foodStar: string[] = []
  const harmStar: string[] = []
  const resourceStar: string[] = []
  const biJian: string[] = []
  const jieCai: string[] = []

  items.forEach((item) => {
    switch (item.tenShen) {
      case '正官':
      case '七杀':
        officialStar.push(`${item.pillar}${item.stem}`)
        break
      case '正财':
      case '偏财':
        wealthStar.push(`${item.pillar}${item.stem}`)
        break
      case '正印':
      case '偏印':
        printStar.push(`${item.pillar}${item.stem}`)
        break
      case '食神':
        foodStar.push(`${item.pillar}${item.stem}`)
        break
      case '伤官':
        harmStar.push(`${item.pillar}${item.stem}`)
        break
      case '比肩':
        biJian.push(`${item.pillar}${item.stem}`)
        break
      case '劫财':
        jieCai.push(`${item.pillar}${item.stem}`)
        resourceStar.push(`${item.pillar}${item.stem}`)
        break
    }
  })

  return {
    items,
    officialStar,
    wealthStar,
    printStar,
    foodStar,
    harmStar,
    resourceStar,
    biJian,
    jieCai
  }
}

export function analyzeDayMasterStrength(chart: BaZiChart): DayMasterStrength {
  const dayMasterGan = chart.dayMasterGan
  const dayMasterWuxing = chart.dayMasterWuxing

  let lingScore = 0
  let diScore = 0
  let shiScore = 0

  const monthZhi = chart.monthPillar.zhi
  const monthWuxing = getZhiWuxing(monthZhi)

  if (monthWuxing === dayMasterWuxing) {
    lingScore += 4
  } else if (WUXING_SHENG[monthWuxing] === dayMasterWuxing) {
    lingScore += 2
  } else if (WUXING_KE[monthWuxing] === dayMasterWuxing) {
    lingScore -= 2
  } else if (WUXING_KE_REVERSE[monthWuxing] === dayMasterWuxing) {
    lingScore += 1
  }

  const zhiList = [chart.yearPillar.zhi, monthZhi, chart.dayPillar.zhi, chart.hourPillar.zhi]

  let hasRoot = false
  zhiList.forEach((zhi) => {
    const cangGan = getZhiCangGan(zhi)
    if (cangGan.includes(dayMasterGan)) {
      hasRoot = true
    }
    const zhiWuxing = getZhiWuxing(zhi)
    if (zhiWuxing === dayMasterWuxing) {
      diScore += 2
    } else if (WUXING_SHENG[zhiWuxing] === dayMasterWuxing) {
      diScore += 1.5
    } else if (WUXING_KE[zhiWuxing] === dayMasterWuxing) {
      diScore -= 1
    }
  })

  if (hasRoot) {
    diScore += 2
  }

  const ganList = [chart.yearPillar.gan, chart.monthPillar.gan, chart.dayPillar.gan, chart.hourPillar.gan]

  let yinCount = 0
  let biCount = 0

  ganList.forEach((gan) => {
    if (isYinStar(gan, dayMasterGan)) yinCount++
    if (isBiStar(gan, dayMasterGan)) biCount++
  })

  shiScore += (yinCount + biCount) * 2

  const ganListOther = ganList.filter((g) => g !== dayMasterGan)
  let guanCount = 0
  let caiCount = 0
  let shiCount = 0

  ganListOther.forEach((gan) => {
    if (isGuanStar(gan, dayMasterGan)) guanCount++
    if (isCaiStar(gan, dayMasterGan)) caiCount++
    if (isShiStar(gan, dayMasterGan) || isShangStar(gan, dayMasterGan)) shiCount++
  })

  shiScore -= (guanCount + caiCount + shiCount) * 1.5

  const totalScore = lingScore + diScore + shiScore

  let level: '极强' | '强' | '中' | '弱' | '极弱'
  let description: string
  let yongShen: string
  let jiShen: string

  if (totalScore >= 8) {
    level = '极强'
    description = '日主极强，五行偏颇明显。需要官杀制身或食伤泄秀，以求平衡。'
    yongShen = '官杀（七杀、正官）、食伤（食神、伤官）'
    jiShen = '印星（正印、偏印）、比劫（比肩、劫财）'
  } else if (totalScore >= 4) {
    level = '强'
    description = '日主偏强，身旺有力。需官杀克制或食伤疏导，以达平衡。'
    yongShen = '官杀（七杀、正官）、食伤（食神、伤官）'
    jiShen = '印星（正印、偏印）、比劫（比肩、劫财）'
  } else if (totalScore >= -4) {
    level = '中'
    description = '日主中和，五行相对平衡。喜用神需根据具体格局定论。'
    yongShen = '根据格局确定'
    jiShen = '根据格局确定'
  } else if (totalScore >= -8) {
    level = '弱'
    description = '日主偏弱，需印比生扶以增强自身力量。'
    yongShen = '印星（正印、偏印）、比劫（比肩、劫财）'
    jiShen = '官杀（七杀、正官）、食伤（食神、伤官）、财星（正财、偏财）'
  } else {
    level = '极弱'
    description = '日主极弱，八字从弱。需顺其气势，不可强行扶助。'
    yongShen = '财星（正财、偏财）、官杀（七杀、正官）'
    jiShen = '印星（正印、偏印）、比劫（比肩、劫财）'
  }

  return {
    level,
    score: totalScore,
    detail: {
      lingScore,
      diScore,
      shiScore
    },
    description,
    yongShen,
    jiShen
  }
}

export function analyzeWuXingBalance(chart: BaZiChart): WuXingBalance {
  const wuxingScores: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0
  }

  const pillars = [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]

  pillars.forEach((pillar) => {
    wuxingScores[pillar.wuxing] += 1

    const cangGans = getZhiCangGan(pillar.zhi)
    cangGans.forEach((gan) => {
      const wuxing = tryGetWuxing(gan)
      if (wuxing) {
        wuxingScores[wuxing] += 0.5
      }
    })
  })

  const maxScore = Math.max(...Object.values(wuxingScores))
  const minScore = Math.min(...Object.values(wuxingScores))

  const excess: string[] = []
  let lacking: string = ''

  Object.entries(wuxingScores).forEach(([wuxing, score]) => {
    if (score >= maxScore && maxScore > 2) {
      excess.push(wuxing)
    }
    if (score === minScore) {
      lacking = wuxing
    }
  })

  let balanceAdvice: string

  if (excess.length > 0 && lacking) {
    balanceAdvice =
      `八字五行${excess.join('、')}偏旺，${lacking}偏弱。` +
      `建议加强${lacking}的方面的能量，适当抑制${excess.join('、')}过旺之势。`
  } else if (excess.length > 0) {
    balanceAdvice = `八字五行${excess.join('、')}偏旺。` + `建议适当抑制${excess.join('、')}的能量，寻求五行平衡。`
  } else if (lacking) {
    balanceAdvice = `八字五行${lacking}偏弱。` + `建议加强${lacking}的能量，以求五行流通顺畅。`
  } else {
    balanceAdvice = '八字五行分布较为均衡，无明显偏颇。保持现状，顺势而为。'
  }

  return {
    wuxingScores,
    excess,
    lacking,
    balanceAdvice
  }
}

export function calculateDayunStartAge(
  gender: 'male' | 'female',
  chart: BaZiChart
): {startAge: number; direction: '顺' | '逆'} {
  const monthGan = chart.monthPillar.gan
  const monthGanIndex = getGanIndex(monthGan)
  const dayGanIndex = chart.dayMasterGanIndex

  let yunDirection: '顺' | '逆'
  let jiaoYunMonthDiff: number

  const yunStartMonth = (monthGanIndex + 1) % 10

  if (gender === 'male') {
    yunDirection = '顺'
    jiaoYunMonthDiff = Math.abs(yunStartMonth - dayGanIndex)
  } else {
    yunDirection = '逆'
    jiaoYunMonthDiff = Math.abs(dayGanIndex - yunStartMonth)
  }

  const startAge = Math.floor((jiaoYunMonthDiff * 10) / 12)

  return {startAge, direction: yunDirection}
}

export function generateDayunSequence(
  _birthMonth: number,
  gender: 'male' | 'female',
  chart: BaZiChart
): Array<{startAge: number; ganZhi: string; element: string}> {
  const dayunInfo = calculateDayunStartAge(gender, chart)
  const startAge = dayunInfo.startAge

  const dayZhi = chart.dayPillar.zhi
  const dayZhiIndex = getZhiIndex(dayZhi)

  let currentZhiIndex: number
  if (dayunInfo.direction === '顺') {
    currentZhiIndex = (dayZhiIndex + 1) % 12
  } else {
    currentZhiIndex = (dayZhiIndex - 1 + 12) % 12
  }

  const monthGan = chart.monthPillar.gan
  const monthGanIndex = getGanIndex(monthGan)

  let currentGanIndex: number
  if (dayunInfo.direction === '顺') {
    currentGanIndex = (monthGanIndex + 1) % 10
  } else {
    currentGanIndex = (monthGanIndex - 1 + 10) % 10
  }

  const dayuns: Array<{startAge: number; ganZhi: string; element: string}> = []

  for (let i = 0; i < 8; i++) {
    const gan = TIANGAN[currentGanIndex]
    const zhi = DIZHI[currentZhiIndex]
    const ganZhi = `${gan}${zhi}`
    const wuxing = tryGetWuxing(gan)

    const ageStart = startAge + i * 10

    dayuns.push({
      startAge: ageStart,
      ganZhi,
      element: wuxing
    })

    currentGanIndex = (currentGanIndex + 1) % 10
    currentZhiIndex = (currentZhiIndex + 1) % 12
  }

  return dayuns
}

export function getLiuNianGanZhi(year: number): string {
  const baseYear = 1984
  const baseGanIndex = 0
  const baseZhiIndex = 0

  const yearDiff = year - baseYear
  const ganIndex = (baseGanIndex + yearDiff) % 10
  const zhiIndex = (baseZhiIndex + yearDiff) % 12

  return `${TIANGAN[ganIndex]}${DIZHI[zhiIndex]}`
}

export function calculateLiuNianScore(year: number, chart: BaZiChart, dayunGanZhi: string): number {
  const liuNianGanZhi = getLiuNianGanZhi(year)
  const liuNianGan = liuNianGanZhi.slice(0, 1)
  const _liuNianZhi = liuNianGanZhi.slice(1)

  const liuNianWuxing = tryGetWuxing(liuNianGan)
  const dayMasterWuxing = chart.dayMasterWuxing

  let score = 5

  if (liuNianWuxing === dayMasterWuxing) {
    score += 1.5
  } else if (WUXING_SHENG[dayMasterWuxing] === liuNianWuxing) {
    score += 1
  } else if (WUXING_KE[dayMasterWuxing] === liuNianWuxing) {
    score -= 1.5
  }

  const tenShen = getTenShen(liuNianGan, chart.dayMasterGan)
  const favorable = ['正官', '七杀', '正印', '偏印', '食神']
  const unfavorable = ['伤官', '偏财', '正财']

  if (favorable.includes(tenShen)) score += 0.5
  if (unfavorable.includes(tenShen)) score -= 0.3

  const dayunGan = dayunGanZhi.slice(0, 1)
  const dayunWuxing = tryGetWuxing(dayunGan)

  if (dayunWuxing === liuNianWuxing) {
    score += 0.5
  } else if (WUXING_SHENG[dayunWuxing] === liuNianWuxing) {
    score += 0.3
  }

  return Math.max(1, Math.min(10, score))
}

export interface KLineDataPoint {
  age: number
  year: number
  ganZhi: string
  wuxing: string
  open: number
  close: number
  high: number
  low: number
  score: number
  trend: string
  description: string
  tenShen: string
  dayunGanZhi: string
}

export interface EnhancedDayunPeriod {
  startAge: number
  endAge: number
  ganZhi: string
  element: string
  description: string
}

export interface KLineGenerationOptions {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  gender: 'male' | 'female'
  birthRegion?: string
  calendarType?: 'solar' | 'lunar'
}

function getAgeForYear(birthYear: number, targetYear: number): number {
  return targetYear - birthYear
}

function calculateEnhancedLiuNianScore(
  year: number,
  chart: BaZiChart,
  dayun: EnhancedDayunPeriod,
  strength: DayMasterStrength,
  birthRegion?: string,
  eraFactor?: EraFactor
): number {
  const liuNianGanZhi = getLiuNianGanZhi(year)
  const liuNianGan = liuNianGanZhi.slice(0, 1)
  const _liuNianZhi = liuNianGanZhi.slice(1)
  const liuNianWuxing = tryGetWuxing(liuNianGan)
  const dayMasterWuxing = chart.dayMasterWuxing

  let score = 5

  const liuNianElementImpact = (): number => {
    if (liuNianWuxing === dayMasterWuxing) return 1.5
    if (WUXING_SHENG[dayMasterWuxing] === liuNianWuxing) return 1
    if (WUXING_KE[dayMasterWuxing] === liuNianWuxing) return -1.5
    if (WUXING_KE_REVERSE[dayMasterWuxing] === liuNianWuxing) return 0.5
    return 0
  }
  score += liuNianElementImpact()

  const tenShen = getTenShen(liuNianGan, chart.dayMasterGan)
  const tenShenImpact = (): number => {
    if (tenShen === '正官' || tenShen === '七杀') {
      if (strength.level === '强' || strength.level === '极强') return 1
      if (strength.level === '弱' || strength.level === '极弱') return -1
      return 0.3
    }
    if (tenShen === '正财' || tenShen === '偏财') {
      if (strength.level === '强' || strength.level === '极强') return 0.8
      if (strength.level === '弱' || strength.level === '极弱') return 0.5
      return 0.3
    }
    if (tenShen === '正印' || tenShen === '偏印') {
      if (strength.level === '弱' || strength.level === '极弱') return 1.2
      if (strength.level === '强' || strength.level === '极强') return -0.8
      return 0.2
    }
    if (tenShen === '食神' || tenShen === '伤官') {
      if (strength.level === '强' || strength.level === '极强') return 0.8
      if (strength.level === '弱' || strength.level === '极弱') return -0.5
      return 0.3
    }
    if (tenShen === '比肩' || tenShen === '劫财') {
      if (strength.level === '弱' || strength.level === '极弱') return 1
      if (strength.level === '强' || strength.level === '极强') return -0.5
      return 0
    }
    return 0
  }
  score += tenShenImpact()

  const dayunGan = dayun.ganZhi.slice(0, 1)
  const dayunWuxing = tryGetWuxing(dayunGan)
  const dayunImpact = (): number => {
    if (dayunWuxing === liuNianWuxing) return 0.5
    if (WUXING_SHENG[dayunWuxing] === liuNianWuxing) return 0.4
    if (WUXING_KE[dayunWuxing] === liuNianWuxing) return -0.4
    return 0
  }
  score += dayunImpact()

  const age = getAgeForYear(chart.yearPillar.gan ? parseInt(chart.yearPillar.gan, 10) : 1990, year)
  const ageImpact = (): number => {
    if (age < 25) return 0.3
    if (age >= 25 && age < 40) return 0.5
    if (age >= 40 && age < 55) return 0.4
    if (age >= 55 && age < 70) return 0.2
    return -0.2
  }
  score += ageImpact()

  if (birthRegion) {
    const regionFactor = getRegionFactor(0, 0, birthRegion)
    score += regionFactor.adjustment
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') score += 0.15
    else if (eraFactor.trend === 'stable') score += 0.05
    else if (eraFactor.trend === 'volatile') score += year % 2 === 0 ? 0.1 : -0.1
    score += eraFactor.adjustment
  }

  return Math.max(1, Math.min(10, Number(score.toFixed(1))))
}
function getLiuNianDescription(score: number, tenShen: string, _age: number): string {
  if (score >= 8.5) {
    if (tenShen === '正官' || tenShen === '七杀') {
      return '事业运势极佳，有贵人相助，宜积极进取，把握机遇。'
    }
    if (tenShen === '正财' || tenShen === '偏财') {
      return '财运亨通，收入可观，适合投资理财，财源广进。'
    }
    if (tenShen === '正印' || tenShen === '偏印') {
      return '学业运势旺盛，有贵人提携，宜学习进修，提升能力。'
    }
    return '运势极佳，诸事顺遂，宜顺势而为，开创新局。'
  } else if (score >= 7) {
    return '运势良好，稳步前进，宜顺势而为，开拓进取。'
  } else if (score >= 5.5) {
    return '运势平稳，波澜不惊，宜稳扎稳打，步步为营。'
  } else if (score >= 4) {
    return '运势一般，起伏较大，需谨慎决策，以守为攻。'
  } else {
    if (tenShen === '伤官' || tenShen === '七杀') {
      return '运势欠佳，多有波折，宜守不宜攻，谨慎行事。'
    }
    if (tenShen === '正官') {
      return '压力较大，需调整心态，以柔克刚，蓄势待发。'
    }
    return '运势较低，宜静不宜动，修身养性，等待时机。'
  }
}

function getCurrentDayun(age: number, dayuns: EnhancedDayunPeriod[]): EnhancedDayunPeriod {
  for (let i = dayuns.length - 1; i >= 0; i--) {
    if (age >= dayuns[i].startAge) {
      return dayuns[i]
    }
  }
  return dayuns.length > 0
    ? dayuns[0]
    : {startAge: 0, endAge: 9, ganZhi: '未知', element: '土', description: '大运信息不明确'}
}

export function generateEnhancedKLineData(options: KLineGenerationOptions): {
  klineData: KLineDataPoint[]
  dayunPeriods: EnhancedDayunPeriod[]
} {
  const {birthYear, birthMonth, birthDay, birthHour, gender, birthRegion, calendarType = 'solar'} = options

  const chart = getBaZiChart(birthYear, birthMonth, birthDay, birthHour, calendarType)
  const strength = analyzeDayMasterStrength(chart)
  const dayunSequence = generateDayunSequence(birthMonth, gender, chart)

  const dayunPeriods: EnhancedDayunPeriod[] = dayunSequence.map((d, _index) => {
    let description = ''
    const dayunWuxing = d.element
    const dayunGan = d.ganZhi.slice(0, 1)
    const _dayunZhi = d.ganZhi.slice(1)
    const tenShen = getTenShen(dayunGan, chart.dayMasterGan)

    if (tenShen === '正官' || tenShen === '七杀') {
      description = '官运亨通，事业有望，宜积极进取。'
    } else if (tenShen === '正财' || tenShen === '偏财') {
      description = '财运旺盛，收入可期，宜理财投资。'
    } else if (tenShen === '正印' || tenShen === '偏印') {
      description = '学业运势佳，有贵人助，宜学习进修。'
    } else if (tenShen === '食神' || tenShen === '伤官') {
      description = '创作运势佳，才思敏捷，宜发挥才能。'
    } else if (tenShen === '比肩' || tenShen === '劫财') {
      description = '人缘运势好，朋友相助，宜团队合作。'
    } else {
      description = '运势平稳，宜顺其自然，稳步发展。'
    }

    return {
      startAge: d.startAge,
      endAge: d.startAge + 9,
      ganZhi: d.ganZhi,
      element: dayunWuxing,
      description
    }
  })

  const klineData: KLineDataPoint[] = []
  const currentYear = new Date().getFullYear()
  const endAge = 85
  const startAge = 5

  for (let age = startAge; age <= endAge; age++) {
    const year = birthYear + age
    if (year > currentYear + 5) break

    const liuNianGanZhi = getLiuNianGanZhi(year)
    const liuNianGan = liuNianGanZhi.slice(0, 1)
    const tenShen = getTenShen(liuNianGan, chart.dayMasterGan)
    const dayun = getCurrentDayun(age, dayunPeriods)

    const score = calculateEnhancedLiuNianScore(year, chart, dayun, strength, birthRegion, getEraFactor(birthYear))

    const volatility = 0.8 + Math.abs(score - 5) * 0.4

    function getDeterministicWave(baseYear: number, offset: number): number {
      const combined = baseYear + offset
      const wave1 = Math.sin(combined * 0.5) * 0.3
      const wave2 = Math.cos(combined * 0.3) * 0.2
      const wave3 = Math.sin(combined * 0.7) * 0.1
      return wave1 + wave2 + wave3
    }

    const open = Number((score + getDeterministicWave(year, 0) * volatility).toFixed(1))
    const close = Number((score + getDeterministicWave(year, 1) * volatility).toFixed(1))
    const high = Number((Math.max(open, close) + volatility * 0.3).toFixed(1))
    const low = Number((Math.min(open, close) - volatility * 0.3).toFixed(1))
    const normalizedScore = Math.max(1, Math.min(10, score))

    let trend = ''
    let description = ''

    if (normalizedScore >= 6) {
      trend = '正向'
    } else if (normalizedScore <= 4) {
      trend = '负向'
    } else {
      trend = '平稳'
    }

    description = getLiuNianDescription(normalizedScore, tenShen, age)

    klineData.push({
      age,
      year,
      ganZhi: liuNianGanZhi,
      wuxing: tryGetWuxing(liuNianGan),
      open: Math.max(1, Math.min(10, open)),
      close: Math.max(1, Math.min(10, close)),
      high: Math.max(1, Math.min(10, high)),
      low: Math.max(1, Math.min(10, low)),
      score: normalizedScore,
      trend,
      description,
      tenShen,
      dayunGanZhi: dayun.ganZhi
    })
  }

  return {klineData, dayunPeriods}
}

export interface EnhancedReportData {
  summary: {score: number; content: string}
  personality: {score: number; content: string}
  career: {score: number; content: string}
  wealth: {score: number; content: string}
  marriage: {score: number; content: string}
  health: {score: number; content: string}
  family: {score: number; content: string}
  fengshui: {score: number; content: string}
  baZiInfo: {
    chart: BaZiChart
    tenShen: TenShenAnalysis
    strength: DayMasterStrength
    balance: WuXingBalance
  }
  shenSha: ShenShaAnalysis
  eraFactor: EraFactor
  regionFactor: RegionFactor
}

function getPersonalityByWuxing(
  wuxing: string,
  gender: 'male' | 'female',
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const genderText = gender === 'male' ? '他' : '她'
  const personalityMap: Record<string, {score: number; content: string}> = {
    木: {
      score: 7.5,
      content: `${genderText}性格仁慈宽厚，富有同情心，善于思考和学习。志向远大，有进取心，但有时过于固执，不善变通。`
    },
    火: {
      score: 7.8,
      content: `${genderText}性格热情开朗，积极向上，精力充沛。富有创造力和感染力，但有时脾气急躁，缺乏耐心。`
    },
    土: {
      score: 7.2,
      content: `${genderText}性格稳重踏实，忠厚老实，责任心强。为人可靠，但有时过于保守，缺乏创新精神。`
    },
    金: {
      score: 7.6,
      content: `${genderText}性格刚毅果断，原则性强，有正义感。办事干练，但有时过于刚硬，不懂变通。`
    },
    水: {
      score: 7.4,
      content: `${genderText}性格聪明灵活，善于沟通，适应性强的。直觉敏锐，但有时缺乏定力，容易动摇。`
    }
  }

  const result = personalityMap[wuxing] || {score: 6, content: `${genderText}性格平和，中规中矩。`}

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      result.content += `生于${eraFactor.decade}时代背景，${genderText}具有较强的时代适应性和进取精神。`
    } else if (eraFactor.trend === 'volatile') {
      result.content += `时代变迁较大，${genderText}需要具备较强的应变能力和适应性。`
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '水') {
      result.content += `出生在水旺之地，${genderText}更加灵活变通，适应力强。`
    } else if (regionFactor.mainElement === '火') {
      result.content += `出生在火旺之地，${genderText}性格更加热情开朗。`
    } else if (regionFactor.mainElement === '木') {
      result.content += `出生在木旺之地，${genderText}性格更加温和仁厚。`
    } else if (regionFactor.mainElement === '金') {
      result.content += `出生在金旺之地，${genderText}性格更加果断刚毅。`
    } else if (regionFactor.mainElement === '土') {
      result.content += `出生在土旺之地，${genderText}性格更加稳重踏实。`
    }
  }

  return result
}

function getCareerAdvice(
  tenShen: TenShenAnalysis,
  strength: DayMasterStrength,
  gender: 'male' | 'female',
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const officialCount = tenShen.officialStar.length
  const printCount = tenShen.printStar.length
  const foodCount = tenShen.foodStar.length
  const wealthCount = tenShen.wealthStar.length

  let score = 5
  let content = ''

  if (officialCount > 0) {
    score += 1.5
    content += '官运不错，适合管理类、行政类工作。'
  }
  if (printCount > 0) {
    score += 1
    content += '适合教育、文化、科研类工作。'
  }
  if (foodCount > 0) {
    score += 0.8
    content += '有艺术天赋，适合创意、设计类工作。'
  }
  if (wealthCount > 0) {
    score += 1.2
    content += '财运较好，适合商务、金融类工作。'
  }

  if (strength.level === '强' || strength.level === '极强') {
    content += '适合挑战性工作，能独当一面。'
  } else if (strength.level === '弱' || strength.level === '极弱') {
    content += '适合稳定工作，借助团队力量发展。'
  }

  if (eraFactor) {
    if (eraFactor.decade === '1980s' || eraFactor.decade === '1990s') {
      content += `在${eraFactor.theme}时代背景下，传统行业机遇较多。`
    } else if (eraFactor.decade === '2010s') {
      content += '互联网+时代，适合创新创业和科技相关领域。'
    } else if (eraFactor.decade === '2020s') {
      content += '数字化转型期，适合科技、互联网和新兴行业。'
    }
    if (eraFactor.trend === 'rising') {
      score += 0.2
      content += '时代上升期，事业发展前景良好。'
    } else if (eraFactor.trend === 'volatile') {
      score -= 0.1
      content += '时代变革期，需灵活应对行业变化。'
    }
  }

  if (regionFactor) {
    content += regionFactor.careerAdvice
    if (regionFactor.mainElement === '水') {
      score += 0.1
    } else if (regionFactor.mainElement === '火') {
      score += 0.1
    }
  }

  score = Math.max(1, Math.min(10, score))

  const _genderText = gender === 'male' ? '他' : '她'
  const prefix = gender === 'male' ? '男命' : '女命'

  return {score, content: `${prefix}${content}综合评分${score.toFixed(1)}分。`}
}

function getWealthAdvice(
  tenShen: TenShenAnalysis,
  strength: DayMasterStrength,
  balance: WuXingBalance,
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const wealthCount = tenShen.wealthStar.length
  const biJianCount = tenShen.biJian.length
  const jieCaiCount = tenShen.jieCai.length

  let score = 5
  let content = ''

  if (wealthCount > 0) {
    score += 1.5
    content += '正偏财星透出，有财运。'
  }
  if (biJianCount > 0 || jieCaiCount > 0) {
    score -= 0.5
    content += '注意理财，避免破财。'
  }
  if (balance.excess.includes('金') || balance.excess.includes('水')) {
    score += 0.5
    content += '金水旺相，财运较好。'
  }
  if (balance.lacking === '金' || balance.lacking === '水') {
    score -= 0.5
    content += '金水弱，需要多注意财务规划。'
  }
  if (strength.level === '强' || strength.level === '极强') {
    score += 0.5
    content += '身旺能担财，理财能力较好。'
  } else if (strength.level === '弱' || strength.level === '极弱') {
    score -= 0.5
    content += '身弱难以担财，建议稳健理财。'
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      score += 0.2
      content += '经济上升期，财富积累较易。'
    } else if (eraFactor.trend === 'stable') {
      score += 0.1
      content += '经济稳定期，财富稳步增长。'
    } else if (eraFactor.trend === 'volatile') {
      score -= 0.1
      content += '经济波动期，投资需谨慎。'
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '金' || regionFactor.mainElement === '水') {
      score += 0.15
      content += `所在地区${regionFactor.mainElement}行当令，财运较好。`
    } else if (regionFactor.mainElement === '木' || regionFactor.mainElement === '火') {
      score -= 0.05
      content += `所在地区${regionFactor.mainElement}行当令，财运需靠努力。`
    }
  }

  score = Math.max(1, Math.min(10, score))

  return {score, content: `财富评分${score.toFixed(1)}分。${content}`}
}

function getMarriageAdvice(
  chart: BaZiChart,
  tenShen: TenShenAnalysis,
  gender: 'male' | 'female',
  _shenSha?: ShenShaAnalysis,
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const dayZhi = chart.dayPillar.zhi
  const _dayGan = chart.dayMasterGan

  let score = 5.5
  let content = ''

  const peachArr = ['子', '卯', '午', '酉']
  if (peachArr.includes(dayZhi)) {
    score += 1
    content += '命带桃花，感情丰富，人缘好。'
  }

  if (gender === 'male') {
    if (tenShen.officialStar.length > 0) {
      score += 0.5
      content += '配偶星旺，能得贤内助。'
    }
    if (tenShen.printStar.length > 0) {
      score += 0.3
      content += '配偶善良，有文化修养。'
    }
    content += '男命以正财为妻，偏财为妾。命中有财星者婚姻相对稳定。'
  } else {
    if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) {
      score += 0.5
      content += '命带比劫，感情竞争较多，需要注意。'
    }
    if (tenShen.wealthStar.length > 0) {
      score += 0.5
      content += '配偶经济条件较好。'
    }
    content += '女命以官杀为夫，正官为正夫，七杀为偏夫。官杀纯正者婚姻较顺。'
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      score += 0.1
      content += '时代上升期，社会稳定，有利于婚姻家庭。'
    } else if (eraFactor.trend === 'volatile') {
      score -= 0.1
      content += '时代变革期，感情观念变化较大，需要相互理解。'
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '火') {
      content += '出生地火旺之地，感情热烈直接的表达方式。'
    } else if (regionFactor.mainElement === '水') {
      content += '出生地水旺之地，感情丰富细腻，情感表达较为含蓄。'
    } else if (regionFactor.mainElement === '木') {
      content += '出生地木旺之地，性格温和，感情稳定。'
    } else if (regionFactor.mainElement === '金') {
      content += '出生地金旺之地，感情较为理性直接。'
    } else if (regionFactor.mainElement === '土') {
      content += '出生地土旺之地，感情稳重务实。'
    }
  }

  const ziwuArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const selfPalace = ziwuArr.indexOf(dayZhi)
  const _spousePalace = (selfPalace + 6) % 12

  score = Math.max(1, Math.min(10, score))

  return {
    score,
    content: `婚姻评分${score.toFixed(1)}分。${content}建议晚婚为佳，可减少感情波折。`
  }
}

function getHealthAdvice(
  chart: BaZiChart,
  balance: WuXingBalance,
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const dayMasterWuxing = chart.dayMasterWuxing
  const _wuxingScores = balance.wuxingScores

  let score = 6
  let content = ''

  const healthMap: Record<string, string> = {
    木: '肝胆、神经系统',
    火: '心脏、血液循环',
    土: '脾胃、消化系统',
    金: '肺、呼吸系统',
    水: '肾脏、泌尿系统'
  }

  content += `日主五行属${dayMasterWuxing}，需特别注意${healthMap[dayMasterWuxing]}的健康。`

  const excessWuxing = balance.excess
  if (excessWuxing.length > 0) {
    excessWuxing.forEach((w) => {
      content += `${w}五行过旺，可能影响${healthMap[w]}。`
    })
    score -= 0.5
  }

  if (balance.lacking) {
    content += `${balance.lacking}五行偏弱，整体免疫力可能较低。`
    score -= 0.3
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      content += '时代发展良好，医疗条件优越，健康有保障。'
    } else if (eraFactor.trend === 'volatile') {
      content += '时代变迁大，环境变化快，需要特别注意适应性问题。'
      score -= 0.1
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '水') {
      content += '出生地水旺之地，肾脏功能需要特别关注。'
    } else if (regionFactor.mainElement === '火') {
      content += '出生地火旺之地，心血管系统需要特别关注。'
    } else if (regionFactor.mainElement === '木') {
      content += '出生地木旺之地，肝胆功能需要特别关注。'
    } else if (regionFactor.mainElement === '金') {
      content += '出生地金旺之地，肺部呼吸系统需要特别关注。'
    } else if (regionFactor.mainElement === '土') {
      content += '出生地土旺之地，脾胃消化系统需要特别关注。'
    }
  }

  score = Math.max(1, Math.min(10, score))

  return {
    score,
    content: `健康评分${score.toFixed(1)}分。${content}建议保持规律作息，适度运动，定期体检。`
  }
}

function getFamilyAdvice(
  tenShen: TenShenAnalysis,
  gender: 'male' | 'female',
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  let score = 6
  let content = ''

  if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) {
    content += '兄弟姐妹或朋友缘较好，能得他人相助。'
    score += 0.5
  }

  if (tenShen.printStar.length > 0) {
    content += '能得长辈荫庇，家庭长辈缘好。'
    score += 0.5
  }

  if (tenShen.foodStar.length > 0) {
    content += '子女缘分较好，晚年享子女福。'
    score += 0.3
  }

  if (tenShen.resourceStar.length > 0) {
    content += '学业运势佳，能得教育资源。'
    score += 0.3
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      content += '时代上升期，家庭条件普遍改善，家人生活蒸蒸日上。'
      score += 0.1
    } else if (eraFactor.trend === 'stable') {
      content += '时代稳定期，家庭关系和睦，稳步发展。'
      score += 0.05
    } else if (eraFactor.trend === 'volatile') {
      content += '时代变革期，家庭观念有所变化，需要更多沟通理解。'
      score -= 0.1
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '土') {
      content += '出生地土旺之地，家庭观念重，乡土情怀深厚。'
    } else if (regionFactor.mainElement === '火') {
      content += '出生地火旺之地，家庭氛围热烈融洽。'
    } else if (regionFactor.mainElement === '水') {
      content += '出生地水旺之地，家庭成员间情感交流丰富。'
    } else if (regionFactor.mainElement === '木') {
      content += '出生地木旺之地，家庭关系温和和睦。'
    } else if (regionFactor.mainElement === '金') {
      content += '出生地金旺之地，家庭关系理性有序。'
    }
  }

  const _genderText = gender === 'male' ? '他' : '她'
  const prefix = gender === 'male' ? '男命' : '女命'

  score = Math.max(1, Math.min(10, score))

  return {
    score,
    content: `${prefix}家庭关系评分${score.toFixed(1)}分。${content}建议多花时间陪伴家人，维护家庭和睦。`
  }
}

function getFengshuiAdvice(
  balance: WuXingBalance,
  strength: DayMasterStrength,
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  let content = ''
  let score = 6.5

  const yongshen = strength.yongShen
  const _jishen = strength.jiShen

  if (yongshen.includes('官杀')) {
    content += '适合西方位（属金），能增强事业运。'
  } else if (yongshen.includes('财星')) {
    content += '适合西北方位（属金），能增强财运。'
  } else if (yongshen.includes('印星')) {
    content += '适合南方位（属火），能增强学业运。'
  } else if (yongshen.includes('食伤')) {
    content += '适合东南方位（属木），能增强创作运。'
  }

  if (balance.excess.length > 0) {
    balance.excess.forEach((w) => {
      content += `注意抑制${w}的能量，避免过旺。`
    })
  }

  if (balance.lacking) {
    content += `可加强${balance.lacking}的能量，如摆放相关色调的装饰品。`
  }

  if (eraFactor) {
    if (eraFactor.trend === 'rising') {
      content += '时代上升期，宜积极布局，把握发展机遇。'
      score += 0.2
    } else if (eraFactor.trend === 'stable') {
      content += '时代稳定期，宜稳步发展，夯实基础。'
      score += 0.1
    } else if (eraFactor.trend === 'volatile') {
      content += '时代变革期，宜灵活调整，顺势而为。'
      score -= 0.1
    }
  }

  if (regionFactor) {
    if (regionFactor.mainElement === '金') {
      content += '出生地金旺之地，西方和西北方位尤为有利。'
    } else if (regionFactor.mainElement === '木') {
      content += '出生地木旺之地，东方位和东南方位尤为有利。'
    } else if (regionFactor.mainElement === '水') {
      content += '出生地水旺之地，北方位和东北方位尤为有利。'
    } else if (regionFactor.mainElement === '火') {
      content += '出生地火旺之地，南方位和东南方位尤为有利。'
    } else if (regionFactor.mainElement === '土') {
      content += '出生地土旺之地，西南方位尤为有利。'
    }
  }

  return {
    score,
    content: `风水建议：${content}建议家居布置简洁明亮，保持通风顺畅。`
  }
}

function generateSummary(
  name: string,
  chart: BaZiChart,
  strength: DayMasterStrength,
  balance: WuXingBalance,
  gender: 'male' | 'female',
  eraFactor?: EraFactor,
  regionFactor?: RegionFactor
): {score: number; content: string} {
  const dayMasterWuxing = chart.dayMasterWuxing
  const genderText = gender === 'male' ? '男命' : '女命'
  const strengthText =
    strength.level === '强' || strength.level === '极强'
      ? '身旺'
      : strength.level === '弱' || strength.level === '极弱'
        ? '身弱'
        : '身中和'

  let baseScore = 5
  if (strength.level === '中') baseScore = 6
  if (strength.level === '强' || strength.level === '弱') baseScore = 5.5
  if (strength.level === '极强' || strength.level === '极弱') baseScore = 5

  const excessWuxing = balance.excess.length > 0 ? balance.excess.join('、') : '无明显偏旺'
  const lackingWuxing = balance.lacking || '无明显偏弱'

  let content =
    `${name}（${genderText}），${chart.dayPillar.ganZhi}日主，${dayMasterWuxing}行属，${strengthText}。` +
    `八字五行${excessWuxing}，${lackingWuxing}。` +
    `${strength.description}。`

  if (eraFactor) {
    content += `生于${eraFactor.decade}的${eraFactor.theme}时代，${eraFactor.description}。`
    if (eraFactor.trend === 'rising') {
      content += '时代发展向上，个人发展空间广阔。'
      baseScore += 0.2
    } else if (eraFactor.trend === 'volatile') {
      content += '时代变革较大，需要灵活应对各种变化。'
      baseScore -= 0.1
    }
  }

  if (regionFactor) {
    content += `出生于${regionFactor.region}地区，${regionFactor.mainElement}为主，${regionFactor.subElement}为辅。`
  }

  content += `建议根据喜用神进行人生规划，顺势而为，事半功倍。`

  return {score: baseScore, content}
}
export function generateEnhancedReport(name: string, options: KLineGenerationOptions): EnhancedReportData {
  const {birthYear, birthMonth, birthDay, birthHour, gender, birthRegion, calendarType = 'solar'} = options
  const chart = getBaZiChart(birthYear, birthMonth, birthDay, birthHour, calendarType)
  const tenShen = analyzeTenShen(chart)
  const strength = analyzeDayMasterStrength(chart)
  const balance = analyzeWuXingBalance(chart)
  const shenSha = analyzeShenSha(chart)
  const eraFactor = getEraFactor(birthYear)
  const regionFactor = getRegionFactor(birthYear, birthMonth, birthRegion)
  const summary = generateSummary(name, chart, strength, balance, gender, eraFactor, regionFactor)
  const personality = getPersonalityByWuxing(chart.dayMasterWuxing, gender, eraFactor, regionFactor)
  const career = getCareerAdvice(tenShen, strength, gender, eraFactor, regionFactor)
  const wealth = getWealthAdvice(tenShen, strength, balance, eraFactor, regionFactor)
  const marriage = getMarriageAdvice(chart, tenShen, gender, shenSha, eraFactor, regionFactor)
  const health = getHealthAdvice(chart, balance, eraFactor, regionFactor)
  const family = getFamilyAdvice(tenShen, gender, eraFactor, regionFactor)
  const fengshui = getFengshuiAdvice(balance, strength, eraFactor, regionFactor)
  return {
    summary,
    personality,
    career,
    wealth,
    marriage,
    health,
    family,
    fengshui,
    baZiInfo: {chart, tenShen, strength, balance},
    shenSha,
    eraFactor,
    regionFactor
  }
}
export interface ShenShaItem {
  name: string
  description: string
  impact: 'major' | 'minor' | 'neutral' | 'bad'
}

export interface ShenShaAnalysis {
  items: ShenShaItem[]
  goodShenSha: ShenShaItem[]
  badShenSha: ShenShaItem[]
  overallImpact: number
}

function checkTianYiGuiRen(yearGan: string, dayGan: string): boolean {
  const tianyiMap: Record<string, string> = {
    甲: '丑未',
    乙: '子申',
    丙: '酉',
    丁: '亥',
    戊: '丑未',
    己: '子申',
    庚: '午',
    辛: '寅辰',
    壬: '卯巳',
    癸: '午申'
  }
  return tianyiMap[yearGan]?.includes(dayGan) || false
}

function checkWenChangGuiRen(yearGan: string, dayZhi: string): boolean {
  const wenchangMap: Record<string, string> = {
    甲: '巳',
    乙: '午',
    丙: '申',
    丁: '酉',
    戊: '申',
    己: '酉',
    庚: '亥',
    辛: '子',
    壬: '寅',
    癸: '卯'
  }
  return wenchangMap[yearGan] === dayZhi
}

function checkYiMa(dayZhi: string): boolean {
  const yimaArr = ['寅', '申', '巳', '亥']
  return yimaArr.includes(dayZhi)
}

function checkTaoHua(dayZhi: string): boolean {
  const taohuaArr = ['子', '卯', '午', '酉']
  return taohuaArr.includes(dayZhi)
}

function checkHuaGai(yearGan: string, dayZhi: string): boolean {
  const huagaiMap: Record<string, string> = {
    甲: '戌',
    乙: '戌',
    丙: '丑',
    丁: '丑',
    戊: '辰',
    己: '辰',
    庚: '未',
    辛: '未',
    壬: '戌',
    癸: '戌'
  }
  return huagaiMap[yearGan] === dayZhi
}

function checkJiangXing(dayZhi: string): boolean {
  const jiangxingArr = ['子', '午', '卯', '酉', '寅', '申', '巳', '亥']
  return jiangxingArr.includes(dayZhi)
}

function checkLuShen(dayZhi: string, dayGan: string): boolean {
  const lushenArr = ['寅', '卯', '巳', '午', '申', '酉', '亥', '子']
  if (!lushenArr.includes(dayZhi)) return false
  const luMap: Record<string, string> = {
    甲: '寅',
    乙: '卯',
    丙: '巳',
    丁: '午',
    戊: '巳',
    己: '午',
    庚: '申',
    辛: '酉',
    壬: '亥',
    癸: '子'
  }
  return luMap[dayGan] === dayZhi
}

function checkYangRen(dayZhi: string, dayGan: string): boolean {
  const yangrenArr = ['子', '卯', '午', '酉']
  if (!yangrenArr.includes(dayZhi)) return false
  const yangMap: Record<string, string> = {
    甲: '卯',
    乙: '辰',
    丙: '午',
    丁: '未',
    戊: '午',
    己: '未',
    庚: '酉',
    辛: '戌',
    壬: '子',
    癸: '丑'
  }
  return yangMap[dayGan] === dayZhi
}

function checkTianKong(dayGan: string): boolean {
  const tiankongArr = ['戌', '子']
  const tkMap: Record<string, string> = {
    甲: '戌',
    乙: '亥',
    丙: '丑',
    丁: '寅',
    戊: '卯',
    己: '辰',
    庚: '巳',
    辛: '午',
    壬: '未',
    癸: '申'
  }
  return tiankongArr.includes(tkMap[dayGan])
}

function checkDiJie(dayZhi: string): boolean {
  const dijieArr = ['申', '子', '辰']
  return dijieArr.includes(dayZhi)
}

function checkYueDeGuiRen(monthZhi: string): boolean {
  const yuedeMap: Record<string, string> = {
    寅: '丙',
    卯: '丁',
    辰: '壬',
    巳: '辛',
    午: '庚',
    未: '己',
    申: '戊',
    酉: '己',
    戌: '甲',
    亥: '乙',
    子: '壬',
    丑: '辛'
  }
  return yuedeMap[monthZhi] !== undefined
}

function checkTianDeGuiRen(monthZhi: string): boolean {
  const tiandeMap: Record<string, string> = {
    寅: '丁',
    卯: '丙',
    辰: '壬',
    巳: '辛',
    午: '庚',
    未: '己',
    申: '戊',
    酉: '己',
    戌: '甲',
    亥: '乙',
    子: '壬',
    丑: '辛'
  }
  return tiandeMap[monthZhi] !== undefined
}

function checkTaiJiGuiRen(dayGan: string, dayZhi: string): boolean {
  const taijiMap: Record<string, string> = {
    甲: '子',
    乙: '亥',
    丙: '酉',
    丁: '申',
    戊: '卯',
    己: '寅',
    庚: '丑',
    辛: '子',
    壬: '午',
    癸: '巳'
  }
  return taijiMap[dayGan] === dayZhi
}

function checkGuoYinGuiRen(dayGan: string, dayZhi: string): boolean {
  const guoyinMap: Record<string, string> = {
    甲: '戌',
    乙: '亥',
    丙: '丑',
    丁: '寅',
    戊: '丑',
    己: '寅',
    庚: '辰',
    辛: '巳',
    壬: '未',
    癸: '申'
  }
  return guoyinMap[dayGan] === dayZhi
}

function checkXuTang(dayGan: string, monthZhi: string): boolean {
  const xutangMap: Record<string, string> = {
    甲: '亥',
    乙: '子',
    丙: '寅',
    丁: '卯',
    戊: '巳',
    己: '午',
    庚: '申',
    辛: '酉',
    壬: '亥',
    癸: '子'
  }
  return xutangMap[dayGan] === monthZhi
}

function checkCiGuan(dayGan: string, monthZhi: string): boolean {
  const ciguangMap: Record<string, string> = {
    甲: '寅',
    乙: '卯',
    丙: '巳',
    丁: '午',
    戊: '申',
    己: '酉',
    庚: '亥',
    辛: '子',
    壬: '寅',
    癸: '卯'
  }
  return ciguangMap[dayGan] === monthZhi
}

function checkJinKui(dayGan: string, dayZhi: string): boolean {
  const jinkuiMap: Record<string, string> = {
    甲: '辰',
    乙: '巳',
    丙: '未',
    丁: '申',
    戊: '戌',
    己: '亥',
    庚: '丑',
    辛: '寅',
    壬: '辰',
    癸: '巳'
  }
  return jinkuiMap[dayGan] === dayZhi
}

function checkFuXingGuiRen(yearGan: string, dayZhi: string): boolean {
  const fuxingMap: Record<string, string> = {
    甲: '寅',
    乙: '丑',
    丙: '子',
    丁: '亥',
    戊: '卯',
    己: '寅',
    庚: '丑',
    辛: '子',
    壬: '亥',
    癸: '戌'
  }
  return fuxingMap[yearGan] === dayZhi
}

function checkLongDeGuiRen(monthZhi: string): boolean {
  const longdeArr = ['辰', '巳', '申', '酉', '丑', '寅', '卯', '子']
  return longdeArr.includes(monthZhi)
}

function checkTianYi(monthZhi: string): boolean {
  const tianyiArr = ['寅', '丑', '子', '亥', '戌', '酉', '申', '未']
  return tianyiArr.includes(monthZhi)
}

function checkHongYanSha(dayGan: string, hourZhi: string): boolean {
  const hongyanMap: Record<string, string> = {
    甲: '午',
    乙: '申',
    丙: '寅',
    丁: '酉',
    戊: '卯',
    己: '酉',
    庚: '子',
    辛: '申',
    壬: '酉',
    癸: '申'
  }
  return hongyanMap[dayGan] === hourZhi
}

function checkGuaSu(monthZhi: string, yearZhi: string): boolean {
  const guasuMap: Record<string, string> = {
    寅: '巳',
    申: '亥',
    丑: '戌',
    卯: '子',
    辰: '丑',
    巳: '寅',
    午: '卯',
    未: '辰',
    酉: '午',
    戌: '未',
    亥: '申'
  }
  return guasuMap[monthZhi] === yearZhi
}

function checkGuChen(monthZhi: string, yearZhi: string): boolean {
  const guchenMap: Record<string, string> = {
    寅: '申',
    巳: '亥',
    丑: '寅',
    卯: '申',
    辰: '巳',
    午: '子',
    未: '丑',
    酉: '卯',
    戌: '辰',
    亥: '巳'
  }
  return guchenMap[monthZhi] === yearZhi
}

function checkSanQi(dayGan: string, monthGan: string, yearGan: string): boolean {
  const sanqiArr = ['甲', '戊', '丙', '庚', '壬', '乙', '辛', '癸', '丁', '己']
  const dayGanIdx = sanqiArr.indexOf(dayGan)
  if (dayGanIdx === -1) return false

  const monthIdx = sanqiArr.indexOf(monthGan)
  const yearIdx = sanqiArr.indexOf(yearGan)

  const patterns = [
    [0, 5, 10],
    [1, 6, 8],
    [2, 7, 9],
    [3, 6, 10],
    [4, 7, 9]
  ]

  for (const pattern of patterns) {
    if (pattern.includes(dayGanIdx) && pattern.includes(monthIdx) && pattern.includes(yearIdx)) {
      return true
    }
  }
  return false
}

function checkKuiGang(dayZhi: string, dayGan: string): boolean {
  const kuiGangArr = ['戌', '辰', '寅', '午', '申', '子', '丑', '未']
  const kgMap: Record<string, string> = {
    甲: '戌',
    乙: '辰',
    丙: '寅',
    丁: '午',
    戊: '辰',
    己: '戌',
    庚: '申',
    辛: '子',
    壬: '寅',
    癸: '午'
  }
  return kuiGangArr.includes(dayZhi) && kgMap[dayGan] === dayZhi
}

function checkXueRen(yearZhi: string, dayZhi: string): boolean {
  const xuerenMap: Record<string, string> = {
    子: '酉',
    丑: '午',
    寅: '卯',
    卯: '子',
    辰: '酉',
    巳: '午',
    午: '卯',
    未: '子',
    申: '酉',
    酉: '午',
    戌: '卯',
    亥: '子'
  }
  return xuerenMap[yearZhi] === dayZhi
}

function checkDiaoKe(yearZhi: string, dayZhi: string): boolean {
  const diaokeMap: Record<string, string> = {
    子: '戌',
    丑: '酉',
    寅: '申',
    卯: '未',
    辰: '午',
    巳: '巳',
    午: '辰',
    未: '卯',
    申: '寅',
    酉: '丑',
    戌: '子',
    亥: '亥'
  }
  return diaokeMap[yearZhi] === dayZhi
}

function checkSangMen(yearZhi: string, dayZhi: string): boolean {
  const sangmenMap: Record<string, string> = {
    子: '卯',
    丑: '寅',
    寅: '丑',
    卯: '子',
    辰: '亥',
    巳: '戌',
    午: '酉',
    未: '申',
    申: '未',
    酉: '午',
    戌: '巳',
    亥: '辰'
  }
  return sangmenMap[yearZhi] === dayZhi
}

export function analyzeShenSha(chart: BaZiChart): ShenShaAnalysis {
  const yearGan = chart.yearPillar.gan
  const yearZhi = chart.yearPillar.zhi
  const monthGan = chart.monthPillar.gan
  const monthZhi = chart.monthPillar.zhi
  const dayGan = chart.dayMasterGan
  const dayZhi = chart.dayPillar.zhi
  const hourZhi = chart.hourPillar.zhi

  const items: ShenShaItem[] = []

  if (checkTianYiGuiRen(yearGan, dayGan)) {
    items.push({
      name: '天乙贵人',
      description: '遇难成祥，贵人相助，逢凶化吉。',
      impact: 'major'
    })
  }

  if (checkWenChangGuiRen(yearGan, dayZhi)) {
    items.push({
      name: '文昌贵人',
      description: '学业运势佳，头脑聪明，适合文学艺术。',
      impact: 'major'
    })
  }

  if (checkTaoHua(dayZhi)) {
    items.push({
      name: '桃花',
      description: '人缘好，异性缘佳，但需注意感情风波。',
      impact: 'minor'
    })
  }

  if (checkYiMa(monthZhi)) {
    items.push({
      name: '驿马',
      description: '变动运强，适合外出发展，活动力强。',
      impact: 'minor'
    })
  }

  if (checkHuaGai(yearGan, dayZhi)) {
    items.push({
      name: '华盖',
      description: '聪明才智，但性格孤僻，适合艺术创作。',
      impact: 'neutral'
    })
  }

  if (checkJiangXing(dayZhi)) {
    items.push({
      name: '将星',
      description: '有领导才能，适合管理岗位。',
      impact: 'major'
    })
  }

  if (checkLuShen(dayZhi, dayGan)) {
    items.push({
      name: '禄神',
      description: '财运稳定，收入稳定，但需防破财。',
      impact: 'major'
    })
  }

  if (checkYangRen(dayZhi, dayGan)) {
    items.push({
      name: '羊刃',
      description: '性格刚烈，有冲劲，但需防意外灾祸。',
      impact: 'minor'
    })
  }

  if (checkTianKong(dayGan)) {
    items.push({
      name: '天空',
      description: '思维活跃，想象力丰富，但易流为空想。',
      impact: 'neutral'
    })
  }

  if (checkDiJie(dayZhi)) {
    items.push({
      name: '劫煞',
      description: '易遭破财，需防小人暗算。',
      impact: 'bad'
    })
  }

  if (checkYueDeGuiRen(monthZhi)) {
    items.push({
      name: '月德贵人',
      description: '化险为夷，人缘极佳，适合团队合作。',
      impact: 'major'
    })
  }

  if (checkTianDeGuiRen(monthZhi)) {
    items.push({
      name: '天德贵人',
      description: '福泽深厚，遇难呈祥，德高望重。',
      impact: 'major'
    })
  }

  if (checkTaiJiGuiRen(dayGan, dayZhi)) {
    items.push({
      name: '太极贵人',
      description: '聪慧过人，兴趣广泛，适合哲学宗教。',
      impact: 'major'
    })
  }

  if (checkGuoYinGuiRen(dayGan, dayZhi)) {
    items.push({
      name: '国印贵人',
      description: '有掌权之相，适合仕途，有权威。',
      impact: 'major'
    })
  }

  if (checkXuTang(dayGan, monthZhi)) {
    items.push({
      name: '学堂',
      description: '学习能力佳，适合学术研究，教育行业。',
      impact: 'major'
    })
  }

  if (checkCiGuan(dayGan, monthZhi)) {
    items.push({
      name: '词馆',
      description: '文采出众，适合文字工作，文学创作。',
      impact: 'major'
    })
  }

  if (checkJinKui(dayGan, dayZhi)) {
    items.push({
      name: '金匮',
      description: '有财库，理财能力强，积蓄丰厚。',
      impact: 'major'
    })
  }

  if (checkFuXingGuiRen(yearGan, dayZhi)) {
    items.push({
      name: '福星贵人',
      description: '一生福禄，贵人常伴，生活顺遂。',
      impact: 'major'
    })
  }

  if (checkLongDeGuiRen(monthZhi)) {
    items.push({
      name: '龙德贵人',
      description: '逢凶化吉，好运连连，贵人相助。',
      impact: 'major'
    })
  }

  if (checkTianYi(monthZhi)) {
    items.push({
      name: '天医',
      description: '身体健康，擅长养生，与医疗有缘。',
      impact: 'minor'
    })
  }

  if (checkHongYanSha(dayGan, hourZhi)) {
    items.push({
      name: '红艳煞',
      description: '异性缘强，情感丰富，但需防感情纠纷。',
      impact: 'minor'
    })
  }

  if (checkGuaSu(monthZhi, yearZhi)) {
    items.push({
      name: '挂索',
      description: '易有意外风险，需注意安全。',
      impact: 'bad'
    })
  }

  if (checkGuChen(monthZhi, yearZhi)) {
    items.push({
      name: '孤辰',
      description: '性格较独立，人际交往需努力。',
      impact: 'neutral'
    })
  }

  if (checkSanQi(dayGan, monthGan, yearGan)) {
    items.push({
      name: '三奇',
      description: '特殊运势，有贵人相助，易成大事。',
      impact: 'major'
    })
  }

  if (checkKuiGang(dayZhi, dayGan)) {
    items.push({
      name: '魁罡',
      description: '性格刚强果断，适合管理或武职。',
      impact: 'neutral'
    })
  }

  if (checkXueRen(yearZhi, dayZhi)) {
    items.push({
      name: '血刃',
      description: '注意外伤血光，平时小心谨慎。',
      impact: 'bad'
    })
  }

  if (checkDiaoKe(yearZhi, dayZhi)) {
    items.push({
      name: '吊客',
      description: '易遇丧事或离别之事，需注意孝道。',
      impact: 'bad'
    })
  }

  if (checkSangMen(yearZhi, dayZhi)) {
    items.push({
      name: '丧门',
      description: '家中易有丧事或口舌是非。',
      impact: 'bad'
    })
  }

  const goodShenSha = items.filter((i) => i.impact === 'major')
  const badShenSha = items.filter((i) => i.impact === 'bad')

  let overallImpact = 0
  goodShenSha.forEach((i) => {
    overallImpact += i.impact === 'major' ? 0.5 : 0.2
  })
  badShenSha.forEach(() => {
    overallImpact -= 0.3
  })

  return {
    items,
    goodShenSha,
    badShenSha,
    overallImpact: Math.max(-1, Math.min(2, overallImpact))
  }
}

export interface EraFactor {
  decade: string
  theme: string
  element: string
  trend: 'rising' | 'falling' | 'stable' | 'volatile'
  description: string
  adjustment: number
}

export function getEraFactor(birthYear: number): EraFactor {
  const decade = Math.floor(birthYear / 10) * 10

  if (decade >= 2020) {
    return {
      decade: '2020s',
      theme: '数字化与智能化',
      element: '水',
      trend: 'volatile',
      description: '科技飞速发展，变化剧烈，需要适应能力强。',
      adjustment: 0.1
    }
  }
  if (decade >= 2010) {
    return {
      decade: '2010s',
      theme: '互联网+与创新创业',
      element: '木',
      trend: 'rising',
      description: '创业机遇多，但竞争激烈，需要创新能力。',
      adjustment: 0.15
    }
  }
  if (decade >= 2000) {
    return {
      decade: '2000s',
      theme: '信息化与全球化',
      element: '金',
      trend: 'stable',
      description: '经济全球化，机遇与挑战并存。',
      adjustment: 0.1
    }
  }
  if (decade >= 1990) {
    return {
      decade: '1990s',
      theme: '经济腾飞与消费升级',
      element: '金',
      trend: 'rising',
      description: '经济快速发展，物质生活提升。',
      adjustment: 0.15
    }
  }
  if (decade >= 1980) {
    return {
      decade: '1980s',
      theme: '改革开放与思想解放',
      element: '火',
      trend: 'rising',
      description: '社会变革期，机遇与风险并存。',
      adjustment: 0.1
    }
  }
  return {
    decade: '1970s及之前',
    theme: '传统与现代交替',
    element: '土',
    trend: 'stable',
    description: '传统观念与现代思想交汇，需要平衡取舍。',
    adjustment: 0
  }
}

export interface RegionFactor {
  region: string
  mainElement: string
  subElement: string
  advantages: string[]
  challenges: string[]
  environmentAdvice: string
  careerAdvice: string
  adjustment: number
}

export function getRegionFactor(_birthYear: number, _birthMonth: number, birthRegion?: string): RegionFactor {
  const regionData: Record<string, Omit<RegionFactor, 'region' | 'adjustment'>> = {
    北方: {
      mainElement: '水',
      subElement: '木',
      advantages: ['智慧', '理财', '逻辑思维'],
      challenges: ['行动力', '表达力'],
      environmentAdvice: '适合学习和思考的环境，可适当增加火元素提升活力。',
      careerAdvice: '适合金融、科技、教育等行业。'
    },
    南方: {
      mainElement: '火',
      subElement: '土',
      advantages: ['事业心', '名声', '领导力'],
      challenges: ['财运', '耐心'],
      environmentAdvice: '注意调节情绪，可增加金水元素平衡。',
      careerAdvice: '适合管理、演艺、餐饮等行业。'
    },
    东方: {
      mainElement: '木',
      subElement: '火',
      advantages: ['学业', '发展', '创新'],
      challenges: ['稳定', '保守'],
      environmentAdvice: '适合学习和工作，可适当增加金元素提升财运。',
      careerAdvice: '适合创新、媒体、设计等行业。'
    },
    西方: {
      mainElement: '金',
      subElement: '水',
      advantages: ['财运', '决断', '执行力'],
      challenges: ['人际', '情感'],
      environmentAdvice: '注意人际关系，可增加木元素提升活力。',
      careerAdvice: '适合金融、法律、技术等行业。'
    },
    中原: {
      mainElement: '土',
      subElement: '金',
      advantages: ['人缘', '房产', '稳定'],
      challenges: ['变动', '冒险'],
      environmentAdvice: '适合定居和发展，可适当增加木元素提升财运。',
      careerAdvice: '适合公务员、建筑、农业等行业。'
    }
  }

  if (!birthRegion) {
    const baseData = regionData.中原
    return {
      region: '中原地区',
      mainElement: baseData.mainElement,
      subElement: baseData.subElement,
      advantages: baseData.advantages,
      challenges: baseData.challenges,
      environmentAdvice: baseData.environmentAdvice,
      careerAdvice: baseData.careerAdvice,
      adjustment: 0
    }
  }

  const northCities = [
    '北京',
    '天津',
    '哈尔滨',
    '长春',
    '沈阳',
    '大连',
    '济南',
    '青岛',
    '石家庄',
    '郑州',
    '西安',
    '乌鲁木齐',
    '呼和浩特',
    '太原',
    '兰州'
  ]
  const southCities = [
    '上海',
    '杭州',
    '南京',
    '苏州',
    '广州',
    '深圳',
    '香港',
    '澳门',
    '福州',
    '厦门',
    '长沙',
    '武汉',
    '成都',
    '重庆',
    '南昌',
    '合肥',
    '南宁'
  ]
  const westCities = ['乌鲁木齐', '呼和浩特', '兰州', '西宁', '银川', '昆明', '贵阳']

  const city = birthRegion
  let selectedRegion: string = '中原'
  let adjustment: number = 0

  if (northCities.some((c) => city.includes(c))) {
    selectedRegion = '北方'
    adjustment = 0.1
  } else if (southCities.some((c) => city.includes(c))) {
    selectedRegion = '南方'
    adjustment = 0.1
  } else if (westCities.some((c) => city.includes(c))) {
    selectedRegion = '西方'
    adjustment = 0.1
  } else if (city.includes('上海') || city.includes('杭州') || city.includes('宁波') || city.includes('温州')) {
    selectedRegion = '东方'
    adjustment = 0.1
  }

  const validRegions = ['北方', '南方', '东方', '西方', '中原'] as const
  type ValidRegion = (typeof validRegions)[number]

  const selectedData = validRegions.includes(selectedRegion as ValidRegion)
    ? regionData[selectedRegion as ValidRegion]
    : regionData.中原
  return {
    region: `${selectedRegion}地区`,
    mainElement: selectedData.mainElement,
    subElement: selectedData.subElement,
    advantages: selectedData.advantages,
    challenges: selectedData.challenges,
    environmentAdvice: selectedData.environmentAdvice,
    careerAdvice: selectedData.careerAdvice,
    adjustment
  }
}

function _getSeason(month: number): string {
  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

export interface MangpaiAnalysis {
  formatName: string
  formatType: 'special' | 'normal'
  tiaohou: {
    yongShen: string
    jiShen: string
    advice: string
  }
  xiangShu: {
    main: string
    sub: string[]
    description: string
  }
  lifeAdvice: string
}

export function analyzeMangpai(chart: BaZiChart, strength: DayMasterStrength): MangpaiAnalysis {
  const dayGan = chart.dayMasterGan
  const _dayZhi = chart.dayPillar.zhi
  const _monthZhi = chart.monthPillar.zhi

  let formatName = ''
  let formatType: 'special' | 'normal' = 'normal'

  if (strength.level === '极强' || strength.level === '极弱') {
    formatType = 'special'
    if (strength.level === '极强') {
      formatName = '专旺格'
    } else {
      formatName = '从格'
    }
  } else {
    formatName = `${dayGan}日主普通格`
  }

  const tiaohou = {
    yongShen: strength.yongShen,
    jiShen: strength.jiShen,
    advice: `调候用神为${strength.yongShen}，忌${strength.jiShen}。`
  }

  let mainXiang = ''
  const subXiang: string[] = []
  let xiangDescription = ''

  const tenShen = analyzeTenShen(chart)

  if (tenShen.officialStar.length > 0) {
    mainXiang = '官'
    subXiang.push('印')
    xiangDescription = '官印相生，贵气十足，宜仕途发展。'
  } else if (tenShen.wealthStar.length > 0) {
    mainXiang = '财'
    subXiang.push('官')
    xiangDescription = '财官相配，富贵可求，宜商业发展。'
  } else if (tenShen.printStar.length > 0) {
    mainXiang = '印'
    subXiang.push('官')
    xiangDescription = '印星生身，智慧过人，宜学术发展。'
  }

  let lifeAdvice = ''
  if (formatType === 'special') {
    lifeAdvice = `${formatName}，需顺势而为，不宜强行改变。` + `${tiaohou.advice}建议顺应格局特点，发挥优势。`
  } else {
    lifeAdvice = `普通格局，${tiaohou.advice}` + `建议根据${mainXiang}为主线，${subXiang.join('、')}为辅助来规划人生。`
  }

  return {
    formatName,
    formatType,
    tiaohou,
    xiangShu: {
      main: mainXiang || '无明显特征',
      sub: subXiang,
      description: xiangDescription || '格局需综合分析。'
    },
    lifeAdvice
  }
}

export interface TiaoHouElement {
  element: string
  season: string
  temperature: 'cold' | 'hot' | 'neutral'
  humidity: 'dry' | 'wet' | 'neutral'
  yongShen: string
  advice: string
}

export function analyzeTiaoHou(chart: BaZiChart, strength: DayMasterStrength): TiaoHouElement {
  const monthZhi = chart.monthPillar.zhi
  const dayGan = chart.dayMasterGan
  const monthGan = chart.monthPillar.gan

  const monthSeasons: Record<
    string,
    {season: string; temperature: 'cold' | 'hot' | 'neutral'; humidity: 'dry' | 'wet' | 'neutral'}
  > = {
    寅: {season: '春季', temperature: 'neutral', humidity: 'wet'},
    卯: {season: '春季', temperature: 'neutral', humidity: 'wet'},
    辰: {season: '春季', temperature: 'neutral', humidity: 'neutral'},
    巳: {season: '夏季', temperature: 'hot', humidity: 'dry'},
    午: {season: '夏季', temperature: 'hot', humidity: 'dry'},
    未: {season: '夏季', temperature: 'hot', humidity: 'neutral'},
    申: {season: '秋季', temperature: 'neutral', humidity: 'dry'},
    酉: {season: '秋季', temperature: 'neutral', humidity: 'dry'},
    戌: {season: '秋季', temperature: 'neutral', humidity: 'neutral'},
    亥: {season: '冬季', temperature: 'cold', humidity: 'wet'},
    子: {season: '冬季', temperature: 'cold', humidity: 'wet'},
    丑: {season: '冬季', temperature: 'cold', humidity: 'neutral'}
  }

  const seasonInfo = monthSeasons[monthZhi] || {
    season: '未知',
    temperature: 'neutral' as const,
    humidity: 'neutral' as const
  }

  let yongShen = strength.yongShen
  let advice = ''

  if (seasonInfo.temperature === 'cold' && !['丙', '丁'].includes(dayGan)) {
    yongShen = `火${yongShen}`
    advice += '八字偏寒，需用火调候。'
  }
  if (seasonInfo.temperature === 'hot' && !['壬', '癸'].includes(dayGan)) {
    yongShen = `水${yongShen}`
    advice += '八字偏暖，需用水调候。'
  }
  if (seasonInfo.humidity === 'wet' && !['戊', '己'].includes(dayGan)) {
    advice += '八字偏湿，需用土制水。'
  }
  if (seasonInfo.humidity === 'dry' && !['壬', '癸'].includes(dayGan)) {
    advice += '八字偏燥，需用水润泽。'
  }

  if (advice === '') {
    advice = '八字寒暖燥湿较为平衡，调候以扶抑日主为主。'
  } else {
    advice += `调候用神为${yongShen}，忌${strength.jiShen}。`
  }

  return {
    element: tryGetWuxing(monthGan),
    season: seasonInfo.season,
    temperature: seasonInfo.temperature,
    humidity: seasonInfo.humidity,
    yongShen,
    advice
  }
}

export interface LiuQinItem {
  relation: string
  star: string
  pillar: string
  description: string
  relationship: string
  advice: string
}

export interface LiuQinAnalysis {
  father: LiuQinItem
  mother: LiuQinItem
  spouse: LiuQinItem
  children: LiuQinItem
  siblings: LiuQinItem
}

export function analyzeLiuQin(chart: BaZiChart, tenShen: TenShenAnalysis): LiuQinAnalysis {
  let spouseStar = ''
  if (chart.dayMasterGan === '甲' || chart.dayMasterGan === '乙') {
    spouseStar = '己'
  } else if (chart.dayMasterGan === '丙' || chart.dayMasterGan === '丁') {
    spouseStar = '辛'
  } else if (chart.dayMasterGan === '戊' || chart.dayMasterGan === '己') {
    spouseStar = '壬'
  } else if (chart.dayMasterGan === '庚' || chart.dayMasterGan === '辛') {
    spouseStar = '乙'
  } else if (chart.dayMasterGan === '壬' || chart.dayMasterGan === '癸') {
    spouseStar = '丁'
  }

  function createLiuQinItem(relation: string, star: string, pillar: string): LiuQinItem {
    let relationship = ''
    let description = ''
    let advice = ''

    if (relation === '父亲') {
      relationship = '偏财为父，正财为继母'
      description = `父亲星在${pillar}，表示父亲缘分`
      advice = '八字财星旺者，父亲缘深；财星弱或受克者，需多关心父亲'
    } else if (relation === '母亲') {
      relationship = '正印为母，偏印为继母'
      description = `母亲星在${pillar}，表示母亲缘分`
      advice = '八字印星旺者，母亲缘深；印星弱或受克者，需多关心母亲'
    } else if (relation === '配偶') {
      relationship = '男以正财为妻，女以官杀为夫'
      description = `配偶星在${pillar}，表示配偶缘分`
      advice = '官财星纯正者，婚姻较顺；官财星混杂者，需慎重择偶'
    } else if (relation === '子女') {
      relationship = '食伤为子女'
      description = `子女星在${pillar}，表示子女缘分`
      advice = '食伤星旺者，子女缘深；食伤星弱或受克者，需多花时间陪伴子女'
    } else if (relation === '兄弟姐妹') {
      relationship = '比劫为兄弟姐妹'
      description = `兄弟姐妹星在${pillar}，表示兄弟姐妹缘分`
      advice = '比劫星旺者，兄弟姐妹缘深；比劫星弱或受克者，手足情谊需维护'
    }

    return {relation, star, pillar, description, relationship, advice}
  }

  const fatherPillar = tenShen.wealthStar.length > 0 ? tenShen.wealthStar[0] : '不明确'
  const motherPillar = tenShen.printStar.length > 0 ? tenShen.printStar[0] : '不明确'
  const childrenPillar =
    tenShen.foodStar.length > 0 ? tenShen.foodStar[0] : tenShen.harmStar.length > 0 ? tenShen.harmStar[0] : '不明确'
  const siblingsPillar =
    tenShen.biJian.length > 0 ? tenShen.biJian[0] : tenShen.jieCai.length > 0 ? tenShen.jieCai[0] : '不明确'

  const fatherStar = tenShen.wealthStar.length > 0 ? tenShen.wealthStar[0] : '偏财'
  const motherStar = tenShen.printStar.length > 0 ? tenShen.printStar[0] : '正印'
  const childrenStar =
    tenShen.foodStar.length > 0 ? tenShen.foodStar[0] : tenShen.harmStar.length > 0 ? tenShen.harmStar[0] : '食神'
  const siblingsStar =
    tenShen.biJian.length > 0 ? tenShen.biJian[0] : tenShen.jieCai.length > 0 ? tenShen.jieCai[0] : '比肩'

  return {
    father: createLiuQinItem('父亲', fatherStar, fatherPillar),
    mother: createLiuQinItem('母亲', motherStar, motherPillar),
    spouse: createLiuQinItem('配偶', spouseStar, chart.dayPillar.ganZhi),
    children: createLiuQinItem('子女', childrenStar, childrenPillar),
    siblings: createLiuQinItem('兄弟姐妹', siblingsStar, siblingsPillar)
  }
}

export interface EnhancedMangpaiAnalysis {
  formatName: string
  formatType: 'special' | 'normal'
  tiaohou: TiaoHouElement
  geJu: {
    name: string
    type: string
    description: string
  }
  xiangShu: {
    main: string
    sub: string[]
    description: string
  }
  liuQin: LiuQinAnalysis
  lifeAdvice: string
}

export function analyzeEnhancedMangpai(
  chart: BaZiChart,
  strength: DayMasterStrength,
  tenShen: TenShenAnalysis
): EnhancedMangpaiAnalysis {
  const tiaohou = analyzeTiaoHou(chart, strength)
  const mangpai = analyzeMangpai(chart, strength)
  const liuQin = analyzeLiuQin(chart, tenShen)

  let geJuName = ''
  let geJuType = ''
  let geJuDescription = ''

  if (mangpai.formatType === 'special') {
    geJuName = mangpai.formatName
    geJuType = mangpai.formatType === 'special' ? '特殊格局' : '普通格局'
    geJuDescription =
      mangpai.formatName === '专旺格'
        ? '八字日主极强，需顺势而为，借力打力。'
        : '八字日主极弱，需顺其气势，不可强行扶助。'
  } else {
    const monthGan = chart.monthPillar.gan
    const dayGan = chart.dayMasterGan

    if (monthGan === '甲' && (dayGan === '壬' || dayGan === '癸')) {
      geJuName = '正印格'
      geJuType = '普通格局'
      geJuDescription = '印星当令，聪明智慧，适合学术发展。'
    } else if (tenShen.officialStar.length > 0) {
      geJuName = '正官格'
      geJuType = '普通格局'
      geJuDescription = '官星清正，贵气十足，适合仕途发展。'
    } else if (tenShen.wealthStar.length > 0) {
      geJuName = '正财格'
      geJuType = '普通格局'
      geJuDescription = '财星居月令，经济头脑好，适合商业发展。'
    } else if (tenShen.foodStar.length > 0) {
      geJuName = '食神格'
      geJuType = '普通格局'
      geJuDescription = '食神得令，才思敏捷，适合艺术创作。'
    } else {
      geJuName = '普通命局'
      geJuType = '普通格局'
      geJuDescription = '命局无明显特征，需综合分析。'
    }
  }

  let lifeAdvice = ''
  if (mangpai.formatType === 'special') {
    lifeAdvice = `${mangpai.formatName}，${tiaohou.advice}建议顺应格局特点，顺势而为。`
  } else {
    lifeAdvice = `${geJuName}，${tiaohou.advice}建议根据${mangpai.xiangShu.main}为主线规划人生。`
  }

  return {
    formatName: mangpai.formatName,
    formatType: mangpai.formatType,
    tiaohou,
    geJu: {
      name: geJuName,
      type: geJuType,
      description: geJuDescription
    },
    xiangShu: mangpai.xiangShu,
    liuQin,
    lifeAdvice
  }
}
