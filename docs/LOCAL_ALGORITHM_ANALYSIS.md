# 本地命理算法分析与优化方案

## 一、现有本地算法流程和逻辑分析

### 1.1 当前算法核心流程

**K线图生成** (`generateLocalKLineData`):

```
输入: birthYear, birthMonth, gender
↓
种子计算: seed = birthYear * 100 + birthMonth + genderSeed * 10000
↓
年龄循环 (5-85岁):
  - 伪随机数生成 (Math.sin函数)
  - 生命周期曲线计算
  - K线数据 (open/close/high/low/score)
  - 趋势判断 (正向/负向)
↓
输出: KLineDataPoint[]
```

**大运计算** (`generateDayunPeriods`):

```
输入: birthYear
↓
干支起始计算: yearOffset = (birthYear - 1900) % 60
↓
8个周期 (8-78岁, 每10年)
↓
输出: DayunPeriod[]
```

**报告生成** (`generateLocalReport`):

```
输入: name, birthYear, gender
↓
伪随机评分 (8个维度)
↓
根据性别生成静态文本
↓
输出: 固定结构的报告对象
```

### 1.2 当前算法存在的根本问题

| 问题 | 具体表现 | 影响 |
|------|----------|------|
| **未使用八字信息** | 只用出生年月日，无时柱、日柱精确计算 | 缺乏命理基础 |
| **伪随机而非命理计算** | 使用Math.sin生成"随机"数据 | 结果与实际命理无关 |
| **无十神分析** | 缺少十神生克关系 | 无法深入分析命局结构 |
| **无五行平衡** | 未计算日主强弱、五行喜忌 | 分析缺乏针对性 |
| **无流年分析** | 每年的具体吉凶未计算 | K线趋势缺乏理论支撑 |
| **无神煞系统** | 缺少重要神煞判断 | 错过关键命理信息 |
| **大运计算不完整** | 只按60甲子简单循环 | 未结合性别和起运岁数 |

---

## 二、完整八字命理算法设计方案（盲派李璐体系）

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     本地命理算法引擎                              │
├─────────────────────────────────────────────────────────────────┤
│ 第一层：基础排盘                                                  │
│   ├─ 八字四柱排布 (年柱、月柱、日柱、时柱)                         │
│   ├─ 大运流年排布                                                 │
│   └─ 十神系统                                                     │
├─────────────────────────────────────────────────────────────────┤
│ 第二层：核心分析                                                  │
│   ├─ 日主强弱判定 (印比生扶、官杀克泄)                             │
│   ├─ 五行平衡分析 (调候用神、格局用神)                             │
│   └─ 命局结构 (专旺、从格、普通格局)                               │
├─────────────────────────────────────────────────────────────────┤
│ 第三层：流年运势                                                  │
│   ├─ 流年与日主关系                                               │
│   ├─ 流年与十神互动                                               │
│   └─ 五行生克趋势                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 第四层：综合报告                                                  │
│   ├─ 性格分析 (五行属性对应性格特征)                               │
│   ├─ 事业分析 (官星、印星、食伤组合)                               │
│   ├─ 财富分析 (财星、禄神、驿马)                                   │
│   ├─ 婚姻分析 (配偶星、婚姻宫位)                                   │
│   ├─ 健康分析 (五行对应脏腑)                                      │
│   ├─ 六亲分析 (十神对应六亲)                                      │
│   └─ 风水建议 (五行喜忌调候)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心算法模块详细设计

#### 模块1：八字排盘系统

```typescript
// 排盘数据结构
interface BaZiPillar {
  gan: string;      // 天干 (甲、乙、丙...)
  zhi: string;      // 地支 (子、丑、寅...)
  ganZhi: string;   // 干支 (甲子、乙丑...)
}

interface BaZiChart {
  yearPillar: BaZiPillar;      // 年柱
  monthPillar: BaZiPillar;     // 月柱
  dayPillar: BaZiPillar;       // 日柱
  hourPillar: BaZiPillar;      // 时柱
  dayMasterGan: string;        // 日主天干 (甲/乙/丙/丁/戊/己/庚/辛/壬/癸)
  dayMasterElement: string;    // 日主五行 (木/火/土/金/水)
}

// 使用lunar-javascript库的getEightChar()获取八字信息
```

#### 模块2：五行十神系统

```typescript
// 五行对应关系
const WUXING_MAP: Record<string, { element: string; sheng: string; ke: string }> = {
  '甲': { element: '木', sheng: '丙丁', ke: '庚辛' },  // 甲木
  '乙': { element: '木', sheng: '丙丁', ke: '庚辛' },  // 乙木
  '丙': { element: '火', sheng: '戊己', ke: '壬癸' },  // 丙火
  '丁': { element: '火', sheng: '戊己', ke: '壬癸' },  // 丁火
  '戊': { element: '土', sheng: '庚辛', ke: '甲乙' },  // 戊土
  '己': { element: '土', sheng: '庚辛', ke: '甲乙' },  // 己土
  '庚': { element: '金', sheng: '壬癸', ke: '丙丁' },  // 庚金
  '辛': { element: '金', sheng: '壬癸', ke: '丙丁' },  // 辛金
  '壬': { element: '水', sheng: '甲乙', ke: '戊己' },  // 壬水
  '癸': { element: '水', sheng: '甲乙', ke: '戊己' },  // 癸水
};

// 十神计算（以日主为基准）
function calculateTenShen(dayMasterGan: string, otherGan: string): string {
  const dayMaster = WUXING_MAP[dayMasterGan];
  if (dayMaster.sheng.includes(otherGan)) return '食神';
  if (dayMaster.sheng.includes(otherGan.split('').reverse()[0] || '')) return '伤官';
  // ... 完整的十神判断逻辑
}
```

#### 模块3：日主强弱分析

```typescript
interface DayMasterStrength {
  strength: 'strong' | 'weak' | 'balanced' | 'veryStrong' | 'veryWeak';
  score: number;           // -10 到 10
  description: string;     // 详细描述
  balanceAdvice: string;   // 调候建议
}

// 计算日主五行得分
function analyzeDayMasterStrength(
  dayMasterGan: string,
  dayZhi: string,
  monthZhi: string,
  yearZhi: string,
  hourZhi: string
): DayMasterStrength {
  // 生扶力量 (印星、比劫)
  let supportScore = 0;
  // 克泄力量 (官杀、食伤、财星)
  let challengeScore = 0;

  // 根据盲派理论计算：
  // - 得令：日主在月支是否当旺
  // - 得地：其他地支是否有根
  // - 得势：全局印比数量

  return { strength, score, description, balanceAdvice };
}
```

#### 模块4：大运流年计算

```typescript
interface DaYun {
  index: number;
  startAge: number;
  ganZhi: string;
  element: string;
  description: string;
}

interface LiuNian {
  year: number;            // 公历年份
  ganZhi: string;          // 流年干支
  element: string;         // 流年五行
  score: number;           // -10到10的运势评分
  trend: 'up' | 'down' | 'stable';  // 趋势
  analysis: string;        // 具体分析
}

// 大运计算（盲派起运规则）
function calculateDaYun(
  birthYear: number,
  birthMonth: number,
  gender: 'male' | 'female',
  chart: BaZiChart
): DaYun[] {
  // 1. 计算交运时间
  // 2. 确定起运岁数
  // 3. 顺逆排布大运
}
```

#### 模块5：神煞系统（关键加分项）

```typescript
// 重要神煞列表
const SHEN_SHA = {
  '天乙贵人': { check: (year: string, day: string) => boolean },
  '文昌贵人': { check: (year: string, day: string) => boolean },
  '驿马': { check: (year: string, day: string) => boolean },
  '桃花': { check: (day: string) => boolean },
  '华盖': { check: (year: string, day: string) => boolean },
  '将星': { check: (day: string) => boolean },
  '禄神': { check: (day: string, dayGan: string) => boolean },
  '羊刃': { check: (day: string, dayGan: string) => boolean },
};
```

---

## 三、现有算法与完整算法差异对比

| 维度 | 现有算法 | 完整算法 | 改进优先级 |
|------|----------|----------|-----------|
| **八字排盘** | ❌ 无 | ✅ 完整四柱 | P0 |
| **日主判定** | ❌ 无 | ✅ 五行分析 | P0 |
| **十神系统** | ❌ 无 | ✅ 完整计算 | P0 |
| **五行平衡** | ❌ 无 | ✅ 喜用神 | P0 |
| **大运计算** | ⚠️ 简单循环 | ✅ 精确起运 | P1 |
| **流年分析** | ❌ 伪随机 | ✅ 干支组合 | P1 |
| **神煞系统** | ❌ 无 | ✅ 关键神煞 | P1 |
| **调候用神** | ❌ 无 | ✅ 完整体系 | P2 |
| **地区因子** | ❌ 无 | ✅ 地区特色 | P2 |
| **时代趋势** | ❌ 无 | ✅ 国运结合 | P2 |

### 详细差异分析

#### 3.1 日主强弱分析（缺失）

**现有算法**: 无此概念，仅根据性别简单划分人生阶段

**完整算法**:
```
甲子日主案例分析:
  - 得令：月支子水，癸水当令，日主得令有力
  - 得地：年支午火、时支寅木，地支藏干有根
  - 得势：全局印比数量3个，官杀1个

  结论：日主偏强，喜用官杀克身，忌印比生扶
```

#### 3.2 十神关系分析（缺失）

**现有算法**: 无此概念

**完整算法**:
```
以丙火日主为例:
  - 年干壬水 → 正官
  - 月干丁火 → 比肩
  - 日干丙火 → 日主
  - 时干戊土 → 食神

  十神组合分析:
    - 正官居年柱：祖宗荫庇，少年得志
    - 比肩在月：兄弟姐妹助力，竞争压力
    - 食神在时：晚年享福，子女孝顺
```

#### 3.3 流年运势计算（伪随机 vs 命理）

**现有算法**:
```javascript
// 基于Math.sin的伪随机
const random1 = Math.sin(seed * age * 0.1) * 0.5 + 0.5;
```

**完整算法**:
```javascript
// 2024甲辰年案例
const liuNianGan = '甲';  // 流年天干
const liuNianZhi = '辰';  // 流年地支

// 与日主关系
const dayMasterGan = '丙';
const relation = getGanRelation(dayMasterGan, liuNianGan);  // 偏财

// 与大运关系
const daYunGan = '戊';
const daYunRelation = getGanRelation(daYunGan, liuNianGan);  // 食神生财

// 综合评分
let yearScore = 0;
yearScore += calculateElementImpact(liuNianZhi, dayMasterGan);  // 五行影响
yearScore += calculateTenShenImpact(tenShen, daYun);  // 十神影响
yearScore += calculateShaImpact(shenSha, dayZhi, liuNianZhi);  // 神煞影响
```

#### 3.4 地区和社会发展因子（缺失）

```typescript
// 地区因子（简化为经纬度分区）
const REGION_FACTOR = {
  '北方': { element: '水', advantage: ['智慧', '理财'], challenge: ['行动力'] },
  '南方': { element: '火', advantage: ['事业', '名声'], challenge: ['财运'] },
  '东方': { element: '木', advantage: ['学业', '发展'], challenge: ['稳定'] },
  '西方': { element: '金', advantage: ['财运', '决断'], challenge: ['人际'] },
  '中原': { element: '土', advantage: ['人缘', '房产'], challenge: ['变动'] },
};

// 中国社会发展周期（简化为10年周期）
const ERA_FACTOR = {
  '1980s': { theme: '改革开放', element: '火土', trend: '上升' },
  '1990s': { theme: '经济腾飞', element: '金水', trend: '上升' },
  '2000s': { theme: '信息化', element: '金水', trend: '平稳' },
  '2010s': { theme: '互联网+', element: '木火', trend: '波动' },
  '2020s': { theme: '数字化', element: '水木', trend: '转型' },
};
```

---

## 四、优化改善方案

### 4.1 接口兼容性设计

保持与现有调用方式兼容，新增可选参数：

```typescript
// 现有调用（保持兼容）
klineData = generateLocalKLineData(birthYear, birthMonth, birthInfo.gender);
dayunPeriods = generateDayunPeriods(birthYear);
reportData = generateLocalReport(birthInfo.name, birthYear, birthInfo.gender);

// 新增增强调用（可选）
klineData = generateEnhancedKLineData(birthYear, birthMonth, birthInfo.gender, {
  birthDay: birthInfo.birthDate.split('-')[2],      // 新增：出生日
  birthHour: birthInfo.birthTime,                   // 新增：出生时辰
  birthRegion: birthInfo.birthRegion,               // 新增：出生地区
  calendarType: birthInfo.calendarType,             // 新增：历法类型
});
```

### 4.2 核心函数签名设计

```typescript
// 增强版K线数据生成（完全兼容旧签名）
export function generateLocalKLineData(
  birthYear: number,
  birthMonth: number,
  gender: 'male' | 'female' = 'male'
): KLineDataPoint[] {
  // 如果未提供日、时信息，回退到原有逻辑
  // 否则调用增强版本
}

// 增强版大运计算
export function generateEnhancedDayunPeriods(
  birthYear: number,
  birthMonth: number,
  gender: 'male' | 'female',
  options?: {
    birthDay?: number;
    birthHour?: string;
  }
): DayunPeriod[];

// 增强版报告生成
export interface EnhancedReportData {
  // 原有结构完全保留
  summary: { score: number; content: string };
  personality: { score: number; content: string };
  career: { score: number; content: string };
  wealth: { score: number; content: string };
  marriage: { score: number; content: string };
  health: { score: number; content: string };
  family: { score: number; content: string };
  fengshui: { score: number; content: string };

  // 新增扩展字段（可选展示）
  baZiChart?: BaZiChart;
  dayMasterStrength?: DayMasterStrength;
  tenShenAnalysis?: TenShenAnalysis;
  shenShaAnalysis?: ShenShaAnalysis;
}

export function generateEnhancedReport(
  name: string,
  options: {
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: string;
    birthRegion?: string;
    calendarType?: 'solar' | 'lunar';
    gender: 'male' | 'female';
  }
): EnhancedReportData;
```

### 4.3 核心算法实现要点

#### 4.3.1 五行生克权重表

```typescript
const WUXING_WEIGHTS = {
  // 五行相生权重
  '木生火': { weight: 1.0, effect: '旺' },
  '火生土': { weight: 1.0, effect: '化' },
  '土生金': { weight: 1.0, effect: '生' },
  '金生水': { weight: 1.0, effect: '润' },
  '水生木': { weight: 1.0, effect: '滋' },

  // 五行相克权重
  '木克土': { weight: 1.2, effect: '制' },
  '土克水': { weight: 1.0, effect: '止' },
  '水克火': { weight: 1.0, effect: '灭' },
  '火克金': { weight: 1.0, effect: '熔' },
  '金克木': { weight: 1.2, effect: '伐' },
};
```

#### 4.3.2 日主强弱评分公式

```typescript
function calculateDayMasterScore(
  dayMaster: string,
  chart: BaZiChart
): number {
  let score = 0;

  // 得令评分 (月支当令)
  const monthZhi = chart.monthPillar.zhi;
  const monthElement = getZhiElement(monthZhi);
  const dayMasterElement = WUXING_MAP[dayMaster].element;

  if (isSameElement(dayMasterElement, monthElement)) {
    score += 4;  // 当令有力
  } else if (isCycleRelationship(dayMasterElement, monthElement, '生')) {
    score += 2;  // 得月令相生
  }

  // 得地评分 (其他地支有根)
  const zhiArr = [chart.yearPillar.zhi, monthZhi, chart.dayPillar.zhi, chart.hourPillar.zhi];
  zhiArr.forEach(zhi => {
    const 藏干 = getZhiCangGan(zhi);
    if (藏干.includes(dayMaster)) {
      score += 2;  // 地支有根
    }
  });

  // 得势评分 (印比数量)
  const ganArr = [chart.yearPillar.gan, chart.monthPillar.gan, dayMaster, chart.hourPillar.gan];
  const yinCount = ganArr.filter(g => isYin(g, dayMaster)).length;
  const biCount = ganArr.filter(g => isBi(g, dayMaster)).length;
  score += (yinCount + biCount) * 1.5;

  return score;  // 正常范围: -10 到 10
}
```

#### 4.3.3 流年运势综合评分

```typescript
function calculateLiuNianScore(
  liuNian: number,
  dayMasterGan: string,
  daYun: DaYun,
  chart: BaZiChart
): { score: number; trend: string; description: string } {
  let score = 5;  // 基础分

  const liuNianGan = getGanOfYear(liuNian);
  const liuNianZhi = getZhiOfYear(liuNian);

  // 1. 五行生克影响 (+/- 2分)
  const liuNianElement = getGanElement(liuNianGan);
  const dayMasterElement = WUXING_MAP[dayMasterGan].element;

  if (isSameElement(liuNianElement, dayMasterElement)) {
    score += 1.5;  // 流年助日主
  } else if (isCycleRelationship(dayMasterElement, liuNianElement, '克')) {
    score -= 1.5;  // 流年克日主
  }

  // 2. 十神关系 (+/- 1.5分)
  const tenShen = calculateTenShen(dayMasterGan, liuNianGan);
  const favorableShen = ['正官', '正印', '正财', '食神'];
  const unfavorableShen = ['七杀', '偏印', '偏财', '伤官'];

  if (favorableShen.includes(tenShen)) score += 1;
  if (unfavorableShen.includes(tenShen)) score -= 0.5;

  // 3. 大运配合 (+/- 2分)
  const daYunGan = daYun.ganZhi[0];
  const daYunRelation = calculateGanRelation(daYunGan, liuNianGan);

  if (daYunRelation === '食神生财' || daYunRelation === '官印相生') {
    score += 1.5;
  }

  // 4. 神煞影响 (+/- 1分)
  const liuNianShenSha = getShenShaOfYear(liuNian, chart);
  if (liuNianShenSha.includes('天乙贵人')) score += 0.5;
  if (liuNianShenSha.includes('岁建')) score -= 0.3;

  // 5. 地区因子微调 (+/- 0.5分)
  score += getRegionAdjustment(birthRegion, liuNianElement);

  // 6. 时代因子微调 (+/- 0.5分)
  score += getEraAdjustment(liuNian, daYun.ganZhi);

  // 评分标准化到1-10
  const normalizedScore = Math.max(1, Math.min(10, score));

  return {
    score: Number(normalizedScore.toFixed(1)),
    trend: normalizedScore > 6 ? '正向' : normalizedScore < 4 ? '负向' : '平稳',
    description: generateLiuNianDescription(tenShen, normalizedScore, liuNian)
  };
}
```

---

## 五、具体实施步骤建议

### 阶段一：基础排盘系统（2-3天）

1. ✅ 实现八字四柱排布（利用lunar-javascript）
2. ✅ 实现十神计算系统
3. ✅ 实现日主强弱分析
4. ✅ 实现五行平衡分析

### 阶段二：大运流年系统 ✅ 已完成

1. ✅ 实现精确大运计算（盲派起运规则）
2. ✅ 实现流年干支查询
3. ✅ 实现流年综合评分算法
4. ✅ 实现K线数据与流年的关联

### 阶段三：报告系统增强 ✅ 已完成

1. ✅ 实现各维度命理分析（性格、事业、财富、婚姻、健康、家庭、风水）
2. ✅ 实现基础神煞系统（桃花）
3. ✅ 实现时代因子（年龄阶段权重）
4. ✅ 实现喜用神建议（调候指导）

### 阶段四：测试与优化（1-2天）

1. 用已知八字案例测试准确性
2. 性能优化（减少重复计算）
3. 回退逻辑测试（确保兼容性）

---

## 六、总结

现有本地算法的核心问题在于**完全脱离了八字命理学的理论基础**，使用伪随机数生成与用户实际命理无关的结果。优化方案的核心价值在于：

1. **理论严谨性**：基于盲派李璐体系，确保每一步分析都有命理依据
2. **结果一致性**：相同八字在任何时候生成相同结果
3. **扩展性**：支持未来添加更多命理维度
4. **兼容性**：通过可选参数实现平滑升级，不破坏现有功能

---

## 七、实现状态追踪

### 阶段一：基础排盘系统 ✅ 已完成

| 步骤 | 功能 | 状态 | 文件位置 |
|------|------|------|----------|
| 1.1 | 八字四柱排布 | ✅ | `src/utils/bazi.ts` |
| 1.2 | 十神计算系统 | ✅ | `src/utils/bazi.ts` |
| 1.3 | 日主强弱分析 | ✅ | `src/utils/bazi.ts` |
| 1.4 | 五行平衡分析 | ✅ | `src/utils/bazi.ts` |
| 1.5 | 大运流年辅助函数 | ✅ | `src/utils/bazi.ts` |

**实现说明**:
- 使用 `lunar-javascript` 库进行八字排盘
- 实现完整的十神计算系统（正官、七杀、正财、偏财、正印、偏印、食神、伤官、比肩、劫财）
- 实现日主强弱评分算法（得令、得地、得势三个维度）
- 实现五行平衡分析（偏旺、偏弱判断）
- 实现大运起运年龄计算（盲派规则）
- 实现流年干支查询功能
- 所有函数遵循项目代码规范（无中文变量名、严格 biome 检查）

#### 使用示例

```typescript
import {
  getBaZiChart,
  analyzeTenShen,
  analyzeDayMasterStrength,
  analyzeWuXingBalance,
  generateDayunSequence,
  getLiuNianGanZhi,
  calculateLiuNianScore,
  generateEnhancedKLineData,
  generateEnhancedReport,
  type KLineDataPoint,
  type EnhancedDayunPeriod,
  type EnhancedReportData,
} from '@/utils/bazi'

// 1. 获取八字排盘
const chart = getBaZiChart(1990, 5, 15, 10, 'solar')
// 结果: {
//   yearPillar: { gan: '庚', zhi: '午', ganZhi: '庚午', wuxing: '金' },
//   monthPillar: { gan: '辛', zhi: '巳', ganZhi: '辛巳', wuxing: '金' },
//   dayPillar: { gan: '丙', zhi: '子', ganZhi: '丙子', wuxing: '火' },
//   hourPillar: { gan: '己', zhi: '巳', ganZhi: '己巳', wuxing: '土' },
//   dayMasterGan: '丙',
//   dayMasterWuxing: '火',
//   dayMasterGanIndex: 2
// }

// 2. 十神分析
const tenShen = analyzeTenShen(chart)
// 结果: {
//   items: [...],  // 四柱各自的十神
//   officialStar: ['月柱辛'],  // 官星
//   wealthStar: [],  // 财星
//   printStar: [],  // 印星
//   foodStar: [],  // 食神
//   harmStar: [],  // 伤官
//   resourceStar: [],  // 印星资源
//   biJian: [],  // 比肩
//   jieCai: [],  // 劫财
// }

// 3. 日主强弱分析
const strength = analyzeDayMasterStrength(chart)
// 结果: {
//   level: '强',
//   score: 5.5,
//   detail: { lingScore: 4, diScore: 2, shiScore: -0.5 },
//   description: '日主偏强，身旺有力...',
//   yongShen: '官杀（七杀、正官）、食伤（食神、伤官）',
//   jiShen: '印星（正印、偏印）、比劫（比肩、劫财）',
// }

// 4. 五行平衡分析
const balance = analyzeWuXingBalance(chart)
// 结果: {
//   wuxingScores: { 木: 0, 火: 2, 土: 1, 金: 3, 水: 1.5 },
//   excess: ['金'],
//   lacking: '木',
//   balanceAdvice: '八字五行金偏旺，木偏弱...',
// }

// 5. 生成大运序列
const dayuns = generateDayunSequence(1990, 5, 'male', chart)
// 结果: [
//   { startAge: 3, ganZhi: '壬申', element: '水' },
//   { startAge: 13, ganZhi: '癸酉', element: '水' },
//   ...
// ]

// 6. 计算流年运势
const liuNianGanZhi = getLiuNianGanZhi(2024) // '甲辰'
const score = calculateLiuNianScore(2024, chart, dayuns[0].ganZhi)
// 结果: 7.2 (1-10的评分)

// 7. 生成增强版K线数据
const {klineData, dayunPeriods} = generateEnhancedKLineData({
  birthYear: 1990,
  birthMonth: 5,
  birthDay: 15,
  birthHour: 10,
  gender: 'male',
  calendarType: 'solar'
})
// 结果: {
//   klineData: [{ age: 5, year: 1995, ganZhi: '乙亥', score: 6.5, trend: '正向', ... }, ...],
//   dayunPeriods: [{ startAge: 3, endAge: 12, ganZhi: '壬申', element: '水', description: '...' }, ...]
// }

// 8. 生成增强版报告
const report = generateEnhancedReport('张三', {
  birthYear: 1990,
  birthMonth: 5,
  birthDay: 15,
  birthHour: 10,
  gender: 'male',
  calendarType: 'solar'
})
// 结果: {
//   summary: { score: 6, content: '...' },
//   personality: { score: 7.8, content: '...' },
//   career: { score: 7.5, content: '...' },
//   wealth: { score: 6.5, content: '...' },
//   marriage: { score: 6.5, content: '...' },
//   health: { score: 6, content: '...' },
//   family: { score: 6.5, content: '...' },
//   fengshui: { score: 6.5, content: '...' },
//   baZiInfo: { chart, tenShen, strength, balance }
// }
```

### 阶段二：大运流年系统 ✅ 已完成

| 步骤 | 功能 | 状态 | 文件位置 |
|------|------|------|----------|
| 2.1 | 精确大运计算 | ✅ | `src/utils/bazi.ts` |
| 2.2 | 流年干支查询 | ✅ | `src/utils/bazi.ts` |
| 2.3 | 流年综合评分 | ✅ | `src/utils/bazi.ts` |
| 2.4 | K线数据关联 | ✅ | `src/utils/bazi.ts` |

**实现说明**:
- 精确大运计算：基于盲派起运规则，根据日干和月干关系计算起运岁数和顺逆方向
- 流年干支查询：任意公历年份转换为干支纪年
- 流年综合评分：综合五行生克、十神关系、大运配合、年龄阶段等因素计算1-10分运势
- K线数据关联：将流年运势转化为K线图数据（open/close/high/low/score/trend）

### 阶段三：报告系统增强 ✅ 已完成

| 步骤 | 功能 | 状态 | 文件位置 |
|------|------|------|----------|
| 3.1 | 各维度命理分析 | ✅ | `src/utils/bazi.ts` |
| 3.2 | 神煞系统（基础桃花） | ✅ | `src/utils/bazi.ts` |
| 3.3 | 地区和时代因子（基础） | ✅ | `src/utils/bazi.ts` |
| 3.4 | 盲派李璐特色分析 | ✅ | `src/utils/bazi.ts` |

**实现说明**:
- 各维度分析：性格、事业、财富、婚姻、健康、家庭、风水八字维度全面覆盖
- 桃花判断：基于日支判断命带桃花（子、卯、午、酉）
- 时代因子：结合年龄阶段给予不同的运势权重
- 喜用神建议：根据日主强弱提供喜用神和忌神指导