// K线图本地算法 - 作为AI服务不可用时的备用方案

export interface KLineDataPoint {
  age: number
  open: number
  close: number
  high: number
  low: number
  score: number
  trend: string
  description?: string
}

export interface DayunPeriod {
  startAge: number
  endAge: number
  ganZhi: string
}

/**
 * 天干地支
 */
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/**
 * 根据出生年份计算大运周期
 */
export function generateDayunPeriods(birthYear: number): DayunPeriod[] {
  const periods: DayunPeriod[] = []
  const startAge = 8 // 大运从8岁开始
  const periodLength = 10 // 每个大运10年

  // 根据出生年份确定起始天干地支
  const yearOffset = (birthYear - 1900) % 60
  const tianganIndex = yearOffset % 10
  const dizhiIndex = yearOffset % 12

  for (let i = 0; i < 8; i++) {
    const age = startAge + i * periodLength
    const tg = TIANGAN[(tianganIndex + i) % 10]
    const dz = DIZHI[(dizhiIndex + i) % 12]

    periods.push({
      startAge: age,
      endAge: age + periodLength - 1,
      ganZhi: `${tg}${dz}`
    })
  }

  return periods
}

/**
 * 生成本地K线数据
 */
export function generateLocalKLineData(birthYear: number, birthMonth: number): KLineDataPoint[] {
  const data: KLineDataPoint[] = []
  const startAge = 5
  const endAge = 85

  // 使用出生年月作为随机种子，确保同一用户生成的数据一致
  const seed = birthYear * 100 + birthMonth

  for (let age = startAge; age <= endAge; age++) {
    // 基于年龄和种子生成伪随机数
    const random1 = Math.sin(seed * age * 0.1) * 0.5 + 0.5
    const random2 = Math.sin(seed * age * 0.2 + 1) * 0.5 + 0.5
    const random3 = Math.sin(seed * age * 0.3 + 2) * 0.5 + 0.5

    // 生命周期曲线：青年上升，中年平稳，老年下降
    let lifeCurve = 5
    if (age < 25) {
      lifeCurve = 4 + (age - 5) * 0.15 // 青年期上升
    } else if (age < 55) {
      lifeCurve = 7 + Math.sin((age - 25) * 0.2) * 1.5 // 中年期波动
    } else {
      lifeCurve = 7 - (age - 55) * 0.05 // 老年期缓降
    }

    // 添加随机波动
    const baseScore = lifeCurve + (random1 - 0.5) * 2
    const volatility = 0.5 + random2 * 1.5

    const open = Math.max(1, Math.min(10, baseScore + (random1 - 0.5) * volatility))
    const close = Math.max(1, Math.min(10, baseScore + (random2 - 0.5) * volatility))
    const high = Math.max(open, close) + random3 * volatility
    const low = Math.min(open, close) - random3 * volatility
    const score = (open + close + high + low) / 4

    // 生成吉凶趋势（简化为"吉"或"凶"）
    let trend = ''
    let description = ''
    if (score >= 6) {
      trend = '吉'
      if (score >= 8) {
        description = '运势极佳，诸事顺遂，宜积极进取，把握良机。'
      } else if (score >= 7) {
        description = '运势良好，稳步前进，宜顺势而为，开拓创新。'
      } else {
        description = '运势平稳向好，波澜不惊，宜稳扎稳打，步步为营。'
      }
    } else {
      trend = '凶'
      if (score < 4) {
        description = '运势欠佳，多有波折，宜守不宜攻，谨慎行事。'
      } else if (score < 5) {
        description = '运势一般，需谨慎决策，宜以守为攻，蓄势待发。'
      } else {
        description = '运势起伏较大，需注意调整，宜修身养性，平和心态。'
      }
    }

    data.push({
      age,
      open: Number(open.toFixed(1)),
      close: Number(close.toFixed(1)),
      high: Number(Math.min(10, high).toFixed(1)),
      low: Number(Math.max(0, low).toFixed(1)),
      score: Number(score.toFixed(1)),
      trend,
      description
    })
  }

  return data
}

/**
 * 生成本地命理报告
 */
export function generateLocalReport(name: string, birthYear: number) {
  // 基于出生年份生成伪随机评分
  const seed = birthYear
  const random = (index: number) => {
    const value = Math.sin(seed * index * 0.1) * 0.5 + 0.5
    return Number((5 + value * 5).toFixed(1))
  }

  return {
    summary: {
      score: random(1),
      content: `${name}命格中正平和，五行流转有序。一生运势起伏有度，青年时期需努力奋斗，中年渐入佳境，晚年福寿安康。性格坚韧不拔，处事稳重，善于把握机遇。建议顺应天时，积极进取，必能成就一番事业。`
    },
    personality: {
      score: random(2),
      content: `性格沉稳内敛，做事有条不紊。待人真诚，重情重义，朋友众多。思维缜密，善于分析，决策果断。但有时过于谨慎，需要更多勇气突破自我。`
    },
    career: {
      score: random(3),
      content: `事业运势稳中有升，适合从事管理、金融、教育等行业。早年需积累经验，中年后事业有成。贵人相助，机遇不断，但需把握时机，积极进取。`
    },
    wealth: {
      score: random(4),
      content: `财运亨通，正财稳定，偏财有机。善于理财，财富积累稳健。中年后财运更佳，但需注意投资风险，切勿贪心。量入为出，财富自然丰盈。`
    },
    marriage: {
      score: random(5),
      content: `婚姻运势良好，配偶贤惠，家庭和睦。感情专一，夫妻恩爱，子女孝顺。但需注意沟通，避免误会。相互理解，白头偕老。`
    },
    health: {
      score: random(6),
      content: `身体健康，精力充沛。但需注意劳逸结合，避免过度劳累。中年后需关注心血管健康，定期体检。保持良好作息，适度运动，可保长寿。`
    },
    family: {
      score: random(7),
      content: `六亲和睦，家庭温馨。父母慈爱，兄弟姐妹情深。子女聪慧，孝顺懂事。家族兴旺，福泽绵长。但需多陪伴家人，珍惜天伦之乐。`
    },
    fengshui: {
      score: random(8),
      content: `宜居东南方位，有利事业发展。家中宜摆放绿植，增旺生气。卧室宜简洁明亮，有助睡眠。办公桌宜面向窗户，采光充足。注意家居整洁，气场流通。`
    }
  }
}
