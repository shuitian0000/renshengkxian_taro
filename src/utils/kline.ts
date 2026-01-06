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
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/**
 * 根据出生年份生成大运周期
 */
export function generateDayunPeriods(birthYear: number): DayunPeriod[] {
  const periods: DayunPeriod[] = []
  const startAge = 5
  const endAge = 85
  const periodLength = 10

  // 根据出生年份计算起始天干地支
  const yearIndex = (birthYear - 1900) % 60
  const tianGanIndex = yearIndex % 10
  const diZhiIndex = yearIndex % 12

  for (let age = startAge; age < endAge; age += periodLength) {
    const periodIndex = Math.floor((age - startAge) / periodLength)
    const currentTianGan = TIAN_GAN[(tianGanIndex + periodIndex) % 10]
    const currentDiZhi = DI_ZHI[(diZhiIndex + periodIndex) % 12]

    periods.push({
      startAge: age,
      endAge: Math.min(age + periodLength - 1, endAge),
      ganZhi: `${currentTianGan}${currentDiZhi}`
    })
  }

  return periods
}

/**
 * 生成K线图数据（本地算法）
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

    // 生成趋势描述
    let trend = ''
    if (score >= 7.5) {
      trend = '运势极佳，诸事顺遂'
    } else if (score >= 6.5) {
      trend = '运势良好，稳步前进'
    } else if (score >= 5.5) {
      trend = '运势平稳，波澜不惊'
    } else if (score >= 4.5) {
      trend = '运势一般，需谨慎行事'
    } else {
      trend = '运势欠佳，宜守不宜攻'
    }

    data.push({
      age,
      open: Number(open.toFixed(1)),
      close: Number(close.toFixed(1)),
      high: Number(Math.min(10, high).toFixed(1)),
      low: Number(Math.max(0, low).toFixed(1)),
      score: Number(score.toFixed(1)),
      trend
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
      content: `${name}命格分析：根据出生年份推算，您的命格属于中上之选。一生运势起伏有致，青年时期需努力奋斗，中年后渐入佳境。性格坚韧，意志坚定，能够克服困难，最终成就一番事业。建议把握机遇，稳扎稳打，方能功成名就。`,
      score: random(1)
    },
    personality: {
      content: `性格特征：您性格沉稳内敛，做事谨慎细致，不轻易表露情感。具有较强的责任心和使命感，对待工作认真负责。善于思考，富有智慧，能够洞察事物本质。但有时过于谨慎，容易错失良机。建议适当放开手脚，勇于尝试，方能发挥潜能。`,
      score: random(2)
    },
    career: {
      content: `事业运势：事业方面，您具有较强的进取心和执行力，能够在工作中取得不错的成绩。适合从事需要耐心和细致的工作，如管理、财务、技术等领域。中年后事业运势渐旺，有望晋升高位。建议把握机遇，积累经验，稳步前进。`,
      score: random(3)
    },
    fengshui: {
      content: `风水建议：居住环境宜选择坐北朝南、采光充足的房屋。办公室或书房宜摆放文昌塔、书籍等物品，有助于提升事业运。卧室宜保持整洁，避免杂物堆积。家中可摆放绿植，增添生气。出行方位以东方、南方为吉，有助于提升运势。`,
      score: random(4)
    },
    wealth: {
      content: `财富运势：财运方面，您属于稳健型，不会有暴富机会，但也不会有大的破财。收入稳定，善于理财，能够积累财富。中年后财运渐旺，有望通过投资获得收益。建议保持理性，避免冒险投资，稳健为上。`,
      score: random(5)
    },
    marriage: {
      content: `婚姻感情：感情方面，您对待感情认真专一，不会轻易动心。适合晚婚，婚后生活和睦。配偶性格温和，能够相互扶持。建议多沟通交流，增进感情，共同经营美好家庭。子女运佳，儿女孝顺，晚年幸福。`,
      score: random(6)
    },
    health: {
      content: `健康状况：健康方面，您体质较好,但需注意劳逸结合。青年时期精力充沛，中年后需注意保养。易患消化系统、呼吸系统疾病，建议定期体检，保持良好作息。适当运动，保持心情愉悦，有助于延年益寿。`,
      score: random(7)
    },
    family: {
      content: `六亲关系：与父母关系融洽，能够得到家庭支持。兄弟姐妹之间感情深厚，相互帮助。子女孝顺，晚年享福。与长辈相处和睦，能够得到贵人相助。建议多关心家人，维系亲情，家和万事兴。`,
      score: random(8)
    }
  }
}
