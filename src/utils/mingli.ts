import {
  analyzeDayMasterStrength,
  analyzeShenSha,
  analyzeTenShen,
  analyzeWuXingBalance,
  type BaZiChart,
  type DayMasterStrength,
  DIZHI,
  type EraFactor,
  getBaZiChart,
  getEraFactor,
  getLiuNianGanZhi,
  getRegionFactor,
  getTenShen,
  type RegionFactor,
  type ShenShaAnalysis,
  type TenShenAnalysis,
  TIANGAN,
  tryGetWuxing,
  WUXING,
  WUXING_KE,
  WUXING_KE_REVERSE,
  WUXING_SHENG,
  type WuXingBalance
} from './bazi'

function getGanIndex(gan: string): number {
  return TIANGAN.indexOf(gan) ?? -1
}

function getZhiIndex(zhi: string): number {
  return DIZHI.indexOf(zhi) ?? -1
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

export interface DayunPeriod {
  startAge: number
  endAge: number
  ganZhi: string
  element: string
  description: string
}

interface MingliReport {
  summary: {score: number; content: string}
  personality: {score: number; content: string}
  career: {score: number; content: string}
  wealth: {score: number; content: string}
  marriage: {score: number; content: string}
  health: {score: number; content: string}
  family: {score: number; content: string}
  fengshui: {score: number; content: string}
}

interface MingliResult {
  klineData: KLineDataPoint[]
  dayunPeriods: DayunPeriod[]
  report: MingliReport
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

interface MingliOptions {
  name: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthTime: string
  gender: 'male' | 'female'
  birthRegion?: string
  calendarType?: 'solar' | 'lunar'
}

const baZiParseCache = new Map<string, {chart: BaZiChart; timestamp: number}>()
const CACHE_TTL = 5 * 60 * 1000

function getCachedBaZi(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  calendarType: 'solar' | 'lunar'
): BaZiChart {
  const cacheKey = `${birthYear}-${birthMonth}-${birthDay}-${birthHour}-${calendarType}`
  const cached = baZiParseCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.chart
  }
  const chart = getBaZiChart(birthYear, birthMonth, birthDay, birthHour, calendarType)
  baZiParseCache.set(cacheKey, {chart, timestamp: Date.now()})
  return chart
}

function calculateDayunStartAge(
  gender: 'male' | 'female',
  monthGan: string,
  dayMasterGan: string
): {startAge: number; direction: '顺' | '逆'} {
  const monthGanIndex = getGanIndex(monthGan)
  const dayGanIndex = getGanIndex(dayMasterGan)
  const yunStartMonth = (monthGanIndex + 1) % 10
  let jiaoYunMonthDiff: number
  let yunDirection: '顺' | '逆'

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

function generateDayunPeriods(chart: BaZiChart, _birthMonth: number, gender: 'male' | 'female'): DayunPeriod[] {
  const dayunInfo = calculateDayunStartAge(gender, chart.monthPillar.gan, chart.dayMasterGan)
  const startAge = dayunInfo.startAge
  const dayZhi = chart.dayPillar.zhi
  const dayZhiIndex = getZhiIndex(dayZhi)
  const monthGanIndex = getGanIndex(chart.monthPillar.gan)

  let currentZhiIndex: number
  let currentGanIndex: number

  if (dayunInfo.direction === '顺') {
    currentZhiIndex = (dayZhiIndex + 1) % 12
    currentGanIndex = (monthGanIndex + 1) % 10
  } else {
    currentZhiIndex = (dayZhiIndex - 1 + 12) % 12
    currentGanIndex = (monthGanIndex - 1 + 10) % 10
  }

  const periods: DayunPeriod[] = []

  for (let i = 0; i < 8; i++) {
    const tg = TIANGAN[currentGanIndex]
    const dz = DIZHI[currentZhiIndex]
    const wuxing = WUXING[tg] || ''
    const ganZhi = `${tg}${dz}`
    const tenShen = getTenShen(tg, chart.dayMasterGan)

    let description = ''
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

    periods.push({
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
      ganZhi,
      element: wuxing,
      description
    })

    currentGanIndex = (currentGanIndex + 1) % 10
    currentZhiIndex = (currentZhiIndex + 1) % 12
  }

  return periods
}

function calculateLiuNianScore(
  year: number,
  birthYear: number,
  chart: BaZiChart,
  dayun: DayunPeriod,
  strength: DayMasterStrength,
  shenSha: ShenShaAnalysis,
  eraFactor: EraFactor,
  regionFactor: RegionFactor
): number {
  const liuNianGanZhi = getLiuNianGanZhi(year)
  const liuNianGan = liuNianGanZhi.slice(0, 1)
  const liuNianWuxing = WUXING[liuNianGan as keyof typeof WUXING] || ''
  const dayMasterWuxing = chart.dayMasterWuxing

  let score = 5

  if (liuNianWuxing === dayMasterWuxing) {
    score += 1.5
  } else if (WUXING_SHENG[dayMasterWuxing] === liuNianWuxing) {
    score += 1
  } else if (WUXING_KE[dayMasterWuxing] === liuNianWuxing) {
    score -= 1.5
  } else if (WUXING_KE_REVERSE[dayMasterWuxing] === liuNianWuxing) {
    score += 0.5
  }

  const tenShen = getTenShen(liuNianGan, chart.dayMasterGan)
  const favorable = ['正官', '七杀', '正印', '偏印', '食神']
  const unfavorable = ['伤官', '偏财', '正财']

  if (favorable.includes(tenShen)) {
    if (strength.level === '强' || strength.level === '极强') score += 1
    else if (strength.level === '弱' || strength.level === '极弱') score -= 1
    else score += 0.5
  }
  if (unfavorable.includes(tenShen)) {
    score -= 0.3
  }

  const dayunGan = dayun.ganZhi.slice(0, 1)
  const dayunWuxing = tryGetWuxing(dayunGan)
  if (dayunWuxing === liuNianWuxing) score += 0.5
  else if (WUXING_SHENG[dayunWuxing] === liuNianWuxing) score += 0.3
  else if (WUXING_KE[dayunWuxing] === liuNianWuxing) score -= 0.3

  score += shenSha.overallImpact

  if (eraFactor.trend === 'rising') score += 0.15
  else if (eraFactor.trend === 'volatile') score += year % 2 === 0 ? 0.1 : -0.1

  score += regionFactor.adjustment

  const age = year - birthYear
  if (age < 25) score += 0.3
  else if (age < 40) score += 0.5
  else if (age < 55) score += 0.4
  else if (age < 70) score += 0.2
  else score -= 0.2

  return Math.max(1, Math.min(10, Number(score.toFixed(1))))
}

function getLiuNianDescription(score: number, tenShen: string): string {
  if (score >= 8.5) {
    if (tenShen === '正官' || tenShen === '七杀') {
      return '流年官运极佳，有贵人相助，宜积极进取，把握机遇。'
    }
    if (tenShen === '正财' || tenShen === '偏财') {
      return '流年财运亨通，收入可观，适合投资理财，财源广进。'
    }
    if (tenShen === '正印' || tenShen === '偏印') {
      return '流年学业运势旺盛，有贵人提携，宜学习进修，提升能力。'
    }
    return '流年运势极佳，诸事顺遂，宜顺势而为，开创新局。'
  } else if (score >= 7) {
    return '流年运势良好，稳步前进，宜顺势而为，开拓进取。'
  } else if (score >= 5.5) {
    return '流年运势平稳，波澜不惊，宜稳扎稳打，步步为营。'
  } else if (score >= 4) {
    return '流年运势一般，起伏较大，需谨慎决策，以守为攻。'
  } else {
    if (tenShen === '伤官' || tenShen === '七杀') {
      return '流年运势欠佳，多有波折，宜守不宜攻，谨慎行事。'
    }
    if (tenShen === '正官') {
      return '流年压力较大，需调整心态，以柔克刚，蓄势待发。'
    }
    return '流年运势较低，宜静不宜动，修身养性，等待时机。'
  }
}

function getCurrentDayun(age: number, dayuns: DayunPeriod[]): DayunPeriod {
  for (let i = dayuns.length - 1; i >= 0; i--) {
    if (age >= dayuns[i].startAge) {
      return dayuns[i]
    }
  }
  return dayuns.length > 0
    ? dayuns[0]
    : {startAge: 0, endAge: 9, ganZhi: '未知', element: '土', description: '大运信息不明确'}
}

function generateKLineData(
  chart: BaZiChart,
  birthYear: number,
  dayunPeriods: DayunPeriod[],
  strength: DayMasterStrength,
  shenSha: ShenShaAnalysis,
  eraFactor: EraFactor,
  regionFactor: RegionFactor
): KLineDataPoint[] {
  const klineData: KLineDataPoint[] = []
  const endAge = 85
  const startAge = 5

  for (let age = startAge; age <= endAge; age++) {
    const year = birthYear + age

    const liuNianGanZhi = getLiuNianGanZhi(year)
    const liuNianGan = liuNianGanZhi.slice(0, 1)
    const liuNianWuxing = tryGetWuxing(liuNianGan)
    const dayun = getCurrentDayun(age, dayunPeriods)
    const score = calculateLiuNianScore(year, birthYear, chart, dayun, strength, shenSha, eraFactor, regionFactor)
    const tenShen = getTenShen(liuNianGan, chart.dayMasterGan)

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
    const high = Number((Math.max(open, close) + volatility * 0.25).toFixed(1))
    const low = Number((Math.min(open, close) - volatility * 0.25).toFixed(1))

    let trend = ''
    if (score >= 6) trend = '正向'
    else if (score <= 4) trend = '负向'
    else trend = '平稳'

    const description = getLiuNianDescription(score, tenShen)

    klineData.push({
      age,
      year,
      ganZhi: liuNianGanZhi,
      wuxing: liuNianWuxing,
      open: Math.max(1, Math.min(10, open)),
      close: Math.max(1, Math.min(10, close)),
      high: Math.max(1, Math.min(10, high)),
      low: Math.max(1, Math.min(10, low)),
      score,
      trend,
      description,
      tenShen,
      dayunGanZhi: dayun.ganZhi
    })
  }

  return klineData
}

function generateReport(
  name: string,
  chart: BaZiChart,
  tenShen: TenShenAnalysis,
  strength: DayMasterStrength,
  balance: WuXingBalance,
  shenSha: ShenShaAnalysis,
  gender: 'male' | 'female',
  eraFactor: EraFactor,
  regionFactor: RegionFactor
): MingliReport {
  const genderText = gender === 'male' ? '男命' : '女命'
  const dayMasterWuxing = chart.dayMasterWuxing

  const summaryScore = () => {
    let s = 5
    if (strength.level === '中') s = 6
    else if (strength.level === '强' || strength.level === '弱') s = 5.5
    else if (strength.level === '极强' || strength.level === '极弱') s = 5
    if (eraFactor.trend === 'rising') s += 0.2
    else if (eraFactor.trend === 'volatile') s -= 0.1
    s += shenSha.overallImpact
    return Math.max(1, Math.min(10, s))
  }

  const summaryContent = () => {
    const excess = balance.excess.length > 0 ? balance.excess.join('、') : '无明显偏旺'
    const lacking = balance.lacking || '无明显偏弱'
    return `${name}（${genderText}），${chart.dayPillar.ganZhi}日主，${dayMasterWuxing}行属，${strength.level === '强' || strength.level === '极强' ? '身旺' : strength.level === '弱' || strength.level === '极弱' ? '身弱' : '身中和'}。八字五行${excess}，${lacking}。${strength.description}生于${eraFactor.decade}的${eraFactor.theme}时代。出生于${regionFactor.region}地区。建议根据喜用神进行人生规划，顺势而为。`
  }

  const personalityScore = () => {
    let s = 6
    const wuxingScores: Record<string, number> = {
      木: 7.5,
      火: 7.8,
      土: 7.2,
      金: 7.6,
      水: 7.4
    }
    s = wuxingScores[dayMasterWuxing] || 6
    if (eraFactor.trend === 'rising') s += 0.2
    s += shenSha.overallImpact * 0.5
    return Math.max(1, Math.min(10, s))
  }

  const personalityContent = () => {
    const he = gender === 'male' ? '他' : '她'
    const map: Record<string, string> = {
      木: `${he}性格仁慈宽厚，富有同情心，善于思考和学习。志向远大，有进取心，但有时过于固执。`,
      火: `${he}性格热情开朗，积极向上，精力充沛。富有创造力和感染力，但有时脾气急躁。`,
      土: `${he}性格稳重踏实，忠厚老实，责任心强。为人可靠，但有时过于保守。`,
      金: `${he}性格刚毅果断，原则性强，有正义感。办事干练，但有时过于刚硬。`,
      水: `${he}性格聪明灵活，善于沟通，适应性强。直觉敏锐，但有时缺乏定力。`
    }
    let content = map[dayMasterWuxing] || `${he}性格平和。`
    if (eraFactor.trend === 'rising') {
      content += `生于${eraFactor.decade}时代，${he}具有较强的时代适应性和进取精神。`
    } else if (eraFactor.trend === 'volatile') {
      content += `时代变迁较大，${he}需要具备较强的应变能力。`
    }
    return content
  }

  const careerScore = () => {
    let s = 5
    if (tenShen.officialStar.length > 0) s += 1.5
    if (tenShen.printStar.length > 0) s += 1
    if (tenShen.foodStar.length > 0) s += 0.8
    if (tenShen.wealthStar.length > 0) s += 1.2
    if (strength.level === '强' || strength.level === '极强') s += 0.3
    if (eraFactor.trend === 'rising') s += 0.2
    if (regionFactor.mainElement === '金' || regionFactor.mainElement === '水') s += 0.1
    return Math.max(1, Math.min(10, s))
  }

  const careerContent = () => {
    let content = ''
    if (tenShen.officialStar.length > 0) content += '官运不错，适合管理类、行政类工作。'
    if (tenShen.printStar.length > 0) content += '适合教育、文化、科研类工作。'
    if (tenShen.foodStar.length > 0) content += '有艺术天赋，适合创意、设计类工作。'
    if (tenShen.wealthStar.length > 0) content += '财运较好，适合商务、金融类工作。'
    if (strength.level === '强' || strength.level === '极强') content += '适合挑战性工作，能独当一面。'
    else if (strength.level === '弱' || strength.level === '极弱') content += '适合稳定工作，借助团队力量发展。'
    if (eraFactor.decade === '2010s') content += '互联网+时代，适合创新创业和科技相关领域。'
    else if (eraFactor.decade === '2020s') content += '数字化转型期，适合科技、互联网和新兴行业。'
    return `${genderText}${content}综合评分${careerScore().toFixed(1)}分。`
  }

  const wealthScore = () => {
    let s = 5
    if (tenShen.wealthStar.length > 0) s += 1.5
    if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) s -= 0.5
    if (balance.excess.includes('金') || balance.excess.includes('水')) s += 0.5
    if (balance.lacking === '金' || balance.lacking === '水') s -= 0.5
    if (strength.level === '强' || strength.level === '极强') s += 0.5
    else if (strength.level === '弱' || strength.level === '极弱') s -= 0.5
    if (eraFactor.trend === 'rising') s += 0.2
    if (regionFactor.mainElement === '金' || regionFactor.mainElement === '水') s += 0.15
    return Math.max(1, Math.min(10, s))
  }

  const wealthContent = () => {
    let content = ''
    if (tenShen.wealthStar.length > 0) content += '正偏财星透出，有财运。'
    if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) content += '注意理财，避免破财。'
    if (balance.excess.includes('金') || balance.excess.includes('水')) content += '金水旺相，财运较好。'
    if (strength.level === '强' || strength.level === '极强') content += '身旺能担财，理财能力较好。'
    else if (strength.level === '弱' || strength.level === '极弱') content += '身弱难以担财，建议稳健理财。'
    return `财富评分${wealthScore().toFixed(1)}分。${content}`
  }

  const marriageScore = () => {
    let s = 5.5
    const peachArr = ['子', '卯', '午', '酉']
    if (peachArr.includes(chart.dayPillar.zhi)) {
      s += 1
    }
    if (gender === 'male') {
      if (tenShen.officialStar.length > 0) s += 0.5
    } else {
      if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) s += 0.5
    }
    if (eraFactor.trend === 'rising') s += 0.1
    return Math.max(1, Math.min(10, s))
  }

  const marriageContent = () => {
    let content = ''
    const peachArr = ['子', '卯', '午', '酉']
    if (peachArr.includes(chart.dayPillar.zhi)) {
      content += '命带桃花，感情丰富，人缘好。'
    }
    if (gender === 'male') {
      content += '男命以正财为妻，配偶星旺者能得贤内助。'
    } else {
      content += '女命以官杀为夫，官杀纯正者婚姻较顺。'
    }
    return `婚姻评分${marriageScore().toFixed(1)}分。${content}建议晚婚为佳，可减少感情波折。`
  }

  const healthScore = () => {
    let s = 6
    if (balance.excess.length > 0) s -= 0.5 * balance.excess.length
    if (balance.lacking) s -= 0.3
    if (eraFactor.trend === 'volatile') s -= 0.1
    return Math.max(1, Math.min(10, s))
  }

  const healthContent = () => {
    const healthMap: Record<string, string> = {
      木: '肝胆、神经系统',
      火: '心脏、血液循环',
      土: '脾胃、消化系统',
      金: '肺、呼吸系统',
      水: '肾脏、泌尿系统'
    }
    let content = `日主五行属${dayMasterWuxing}，需特别注意${healthMap[dayMasterWuxing]}的健康。`
    if (balance.excess.length > 0) {
      balance.excess.forEach((w) => {
        content += `${w}五行过旺，可能影响${healthMap[w]}。`
      })
    }
    if (balance.lacking) {
      content += `${balance.lacking}五行偏弱，整体免疫力可能较低。`
    }
    return `健康评分${healthScore().toFixed(1)}分。${content}建议保持规律作息，适度运动，定期体检。`
  }

  const familyScore = () => {
    let s = 6
    if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) {
      s += 0.5
    }
    if (tenShen.printStar.length > 0) s += 0.5
    if (tenShen.foodStar.length > 0) s += 0.3
    if (eraFactor.trend === 'rising') s += 0.1
    return Math.max(1, Math.min(10, s))
  }

  const familyContent = () => {
    let content = ''
    if (tenShen.biJian.length > 0 || tenShen.jieCai.length > 0) {
      content += '兄弟姐妹或朋友缘较好，能得他人相助。'
    }
    if (tenShen.printStar.length > 0) {
      content += '能得长辈荫庇，家庭长辈缘好。'
    }
    if (tenShen.foodStar.length > 0) {
      content += '子女缘分较好，晚年享子女福。'
    }
    return `${genderText}家庭关系评分${familyScore().toFixed(1)}分。${content}建议多花时间陪伴家人。`
  }

  const fengshuiScore = () => {
    let s = 6.5
    if (eraFactor.trend === 'rising') s += 0.2
    else if (eraFactor.trend === 'stable') s += 0.1
    else if (eraFactor.trend === 'volatile') s -= 0.1
    return Math.max(1, Math.min(10, s))
  }

  const fengshuiContent = () => {
    let content = '风水建议：'
    const yongshen = strength.yongShen
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
    return `${content}建议家居布置简洁明亮，保持通风顺畅。`
  }

  return {
    summary: {score: summaryScore(), content: summaryContent()},
    personality: {score: personalityScore(), content: personalityContent()},
    career: {score: careerScore(), content: careerContent()},
    wealth: {score: wealthScore(), content: wealthContent()},
    marriage: {score: marriageScore(), content: marriageContent()},
    health: {score: healthScore(), content: healthContent()},
    family: {score: familyScore(), content: familyContent()},
    fengshui: {score: fengshuiScore(), content: fengshuiContent()}
  }
}

export function generateMingliData(options: MingliOptions): MingliResult {
  const {birthYear, birthMonth, birthDay, birthTime, gender, birthRegion, calendarType = 'solar'} = options

  const safeYear = Math.max(1900, Math.min(2100, birthYear))
  const safeMonth = Math.max(1, Math.min(12, birthMonth))
  const safeDay = Math.max(1, Math.min(31, birthDay))
  const safeHour = Math.max(0, Math.min(23, parseInt(birthTime.split('-')[0], 10) || 12))

  const chart = getCachedBaZi(safeYear, safeMonth, safeDay, safeHour + 1, calendarType)
  const tenShen = analyzeTenShen(chart)
  const strength = analyzeDayMasterStrength(chart)
  const balance = analyzeWuXingBalance(chart)
  const shenSha = analyzeShenSha(chart)
  const eraFactor = getEraFactor(safeYear)
  const regionFactor = getRegionFactor(safeYear, safeMonth, birthRegion)

  const dayunPeriods = generateDayunPeriods(chart, safeMonth, gender)
  const klineData = generateKLineData(chart, safeYear, dayunPeriods, strength, shenSha, eraFactor, regionFactor)
  const report = generateReport(
    options.name,
    chart,
    tenShen,
    strength,
    balance,
    shenSha,
    gender,
    eraFactor,
    regionFactor
  )

  return {
    klineData,
    dayunPeriods,
    report,
    baZiInfo: {chart, tenShen, strength, balance},
    shenSha,
    eraFactor,
    regionFactor
  }
}

export function clearCache(): void {
  baZiParseCache.clear()
}
