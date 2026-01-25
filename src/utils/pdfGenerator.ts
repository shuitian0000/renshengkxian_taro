// PDF生成工具 - 微信小程序环境
// 使用Canvas绘制完整报告并保存为图片到相册
import Taro from '@tarojs/taro'
import type {KLineDataPoint} from './kline'

interface ReportData {
  name: string
  birthDate: string
  birthTime: string
  birthRegion: string
  klineData: KLineDataPoint[]
  reportData: {
    summary: {score: number; content: string}
    personality: {score: number; content: string}
    career: {score: number; content: string}
    wealth: {score: number; content: string}
    marriage: {score: number; content: string}
    health: {score: number; content: string}
    family: {score: number; content: string}
    fengshui: {score: number; content: string}
  }
}

/**
 * 生成报告长图并保存到相册
 * 使用Canvas绘制完整报告（包含K线图和详细报告）
 */
export async function generateAndSavePDF(reportData: ReportData): Promise<boolean> {
  try {
    Taro.showLoading({title: '生成中...', mask: true})

    // 获取系统信息
    const systemInfo = Taro.getSystemInfoSync()
    const dpr = systemInfo.pixelRatio || 2
    const canvasWidth = 750

    // 计算实际需要的高度
    const estimatedHeight = calculateCanvasHeight(reportData)
    const canvasHeight = Math.min(estimatedHeight, 10000) // 限制最大高度

    // 创建Canvas上下文
    const query = Taro.createSelectorQuery()
    query
      .select('#reportCanvas')
      .fields({node: true, size: true})
      .exec(async (res) => {
        if (!res || !res[0]) {
          // 降级到旧API
          await generateWithOldAPI(reportData, canvasWidth, canvasHeight, dpr)
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 设置Canvas尺寸
        canvas.width = canvasWidth * dpr
        canvas.height = canvasHeight * dpr
        ctx.scale(dpr, dpr)

        // 绘制内容
        let currentY = 0

        // 绘制背景
        ctx.fillStyle = '#1A1A1A'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // 绘制标题
        currentY = 60
        ctx.fillStyle = '#D4AF37'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('人生趋势图谱分析报告', canvasWidth / 2, currentY)
        currentY += 80

        // 绘制基本信息
        ctx.fillStyle = '#F5F0E6'
        ctx.font = '28px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`姓名：${reportData.name}`, 60, currentY)
        currentY += 50
        ctx.fillText(`出生日期：${reportData.birthDate} ${reportData.birthTime}`, 60, currentY)
        currentY += 50
        ctx.fillText(`出生地区：${reportData.birthRegion}`, 60, currentY)
        currentY += 80

        // 绘制K线图
        currentY = drawKLineChartNew(ctx, reportData.klineData, 60, currentY, canvasWidth - 120)
        currentY += 80

        // 绘制分析报告各章节
        const sections = [
          {title: '综合评估', data: reportData.reportData.summary},
          {title: '性格分析', data: reportData.reportData.personality},
          {title: '事业分析', data: reportData.reportData.career},
          {title: '财富分析', data: reportData.reportData.wealth},
          {title: '婚姻分析', data: reportData.reportData.marriage},
          {title: '健康分析', data: reportData.reportData.health},
          {title: '家庭关系', data: reportData.reportData.family},
          {title: '环境建议', data: reportData.reportData.fengshui}
        ]

        for (const section of sections) {
          currentY = drawReportSectionNew(ctx, section.title, section.data, 60, currentY, canvasWidth - 120)
        }

        // 绘制免责声明
        currentY += 40
        ctx.fillStyle = '#D4AF37'
        ctx.font = '24px sans-serif'
        ctx.fillText('免责声明', 60, currentY)
        currentY += 40
        ctx.fillStyle = '#B3B3B3'
        ctx.font = '20px sans-serif'
        const disclaimerText =
          '本报告基于数据模型和算法分析生成，仅供参考娱乐，不构成任何决策依据。人生趋势受多种因素影响，建议理性看待，积极进取。'
        const disclaimerLines = wrapTextNew(ctx, disclaimerText, canvasWidth - 120, 20)
        for (const line of disclaimerLines) {
          ctx.fillText(line, 60, currentY)
          currentY += 35
        }

        try {
          // 导出图片（使用Taro的canvasToTempFilePath，因为toDataURL在小程序中不支持）
          const res = await Taro.canvasToTempFilePath({
            canvas: canvas,
            width: canvasWidth,
            height: currentY
          })

          // 保存到相册
          await Taro.saveImageToPhotosAlbum({
            filePath: res.tempFilePath
          })

          Taro.hideLoading()
          Taro.showToast({
            title: '已保存到相册',
            icon: 'success',
            duration: 2000
          })
        } catch (saveError: any) {
          console.error('保存图片失败:', saveError)
          Taro.hideLoading()

          if (saveError.errMsg?.includes('auth deny') || saveError.errMsg?.includes('authorize')) {
            Taro.showModal({
              title: '需要授权',
              content: '请授权保存图片到相册',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) {
                  Taro.openSetting()
                }
              }
            })
          } else {
            Taro.showToast({
              title: `保存失败：${saveError.errMsg || '未知错误'}`,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })

    return true
  } catch (error: any) {
    console.error('生成报告失败:', error)
    Taro.hideLoading()

    Taro.showToast({
      title: `生成失败：${error.message || error.errMsg || '未知错误'}`,
      icon: 'none',
      duration: 3000
    })

    return false
  }
}

/**
 * 使用旧API生成（降级方案）
 */
async function generateWithOldAPI(reportData: ReportData, canvasWidth: number, canvasHeight: number, dpr: number) {
  try {
    const ctx = Taro.createCanvasContext('reportCanvas')

    // 设置Canvas尺寸
    let currentY = 0

    // 绘制背景
    ctx.setFillStyle('#1A1A1A')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 绘制标题
    currentY = 60
    ctx.setFillStyle('#D4AF37')
    ctx.setFontSize(48)
    ctx.setTextAlign('center')
    ctx.fillText('人生趋势图谱分析报告', canvasWidth / 2, currentY)
    currentY += 80

    // 绘制基本信息
    ctx.setFillStyle('#F5F0E6')
    ctx.setFontSize(28)
    ctx.setTextAlign('left')
    ctx.fillText(`姓名：${reportData.name}`, 60, currentY)
    currentY += 50
    ctx.fillText(`出生日期：${reportData.birthDate} ${reportData.birthTime}`, 60, currentY)
    currentY += 50
    ctx.fillText(`出生地区：${reportData.birthRegion}`, 60, currentY)
    currentY += 80

    // 绘制K线图
    currentY = drawKLineChart(ctx, reportData.klineData, 60, currentY, canvasWidth - 120)
    currentY += 80

    // 绘制分析报告各章节
    const sections = [
      {title: '综合评估', data: reportData.reportData.summary},
      {title: '性格分析', data: reportData.reportData.personality},
      {title: '事业分析', data: reportData.reportData.career},
      {title: '财富分析', data: reportData.reportData.wealth},
      {title: '婚姻分析', data: reportData.reportData.marriage},
      {title: '健康分析', data: reportData.reportData.health},
      {title: '家庭关系', data: reportData.reportData.family},
      {title: '环境建议', data: reportData.reportData.fengshui}
    ]

    for (const section of sections) {
      currentY = drawReportSection(ctx, section.title, section.data, 60, currentY, canvasWidth - 120)
    }

    // 绘制免责声明
    currentY += 40
    ctx.setFillStyle('#D4AF37')
    ctx.setFontSize(24)
    ctx.fillText('免责声明', 60, currentY)
    currentY += 40
    ctx.setFillStyle('#B3B3B3')
    ctx.setFontSize(20)
    const disclaimerText =
      '本报告基于数据模型和算法分析生成，仅供参考娱乐，不构成任何决策依据。人生趋势受多种因素影响，建议理性看待，积极进取。'
    const disclaimerLines = wrapText(ctx, disclaimerText, canvasWidth - 120, 20)
    for (const line of disclaimerLines) {
      ctx.fillText(line, 60, currentY)
      currentY += 35
    }

    currentY += 60

    // 绘制到Canvas
    ctx.draw(false, async () => {
      try {
        // 等待一下确保绘制完成
        await new Promise((resolve) => setTimeout(resolve, 500))

        // 导出图片
        const res = await Taro.canvasToTempFilePath({
          canvasId: 'reportCanvas',
          destWidth: canvasWidth * dpr,
          destHeight: currentY * dpr,
          width: canvasWidth,
          height: currentY
        })

        // 保存到相册
        await Taro.saveImageToPhotosAlbum({
          filePath: res.tempFilePath
        })

        Taro.hideLoading()
        Taro.showToast({
          title: '已保存到相册',
          icon: 'success',
          duration: 2000
        })
      } catch (saveError: any) {
        console.error('保存图片失败:', saveError)
        Taro.hideLoading()

        if (saveError.errMsg?.includes('auth deny') || saveError.errMsg?.includes('authorize')) {
          Taro.showModal({
            title: '需要授权',
            content: '请授权保存图片到相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                Taro.openSetting()
              }
            }
          })
        } else {
          Taro.showToast({
            title: `保存失败：${saveError.errMsg || '未知错误'}`,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  } catch (error: any) {
    console.error('生成报告失败:', error)
    Taro.hideLoading()
    throw error
  }
}

/**
 * 计算Canvas所需高度
 */
function calculateCanvasHeight(_reportData: ReportData): number {
  let height = 0

  // 标题和基本信息
  height += 60 + 80 + 50 + 50 + 50 + 80

  // K线图
  height += 400 + 50 + 40 + 80

  // 报告章节（8个章节，每个约200px）
  height += 8 * 200

  // 免责声明
  height += 40 + 40 + 100 + 60

  return height
}

/**
 * 绘制K线图（新API）
 */
function drawKLineChartNew(ctx: any, data: KLineDataPoint[], x: number, y: number, width: number): number {
  const chartHeight = 400
  const chartWidth = width

  // 绘制标题
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('趋势K线图', x, y)
  y += 50

  // 绘制K线图背景
  ctx.fillStyle = '#2A2A2A'
  ctx.fillRect(x, y, chartWidth, chartHeight)

  // 绘制网格线
  ctx.strokeStyle = '#3A3A3A'
  ctx.lineWidth = 1
  for (let i = 0; i <= 10; i += 2) {
    const gridY = y + (chartHeight * (10 - i)) / 10
    ctx.beginPath()
    ctx.moveTo(x, gridY)
    ctx.lineTo(x + chartWidth, gridY)
    ctx.stroke()

    // 绘制Y轴标签
    ctx.fillStyle = '#B3B3B3'
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(i.toString(), x - 10, gridY + 7)
  }

  // 绘制K线
  const barWidth = chartWidth / data.length
  data.forEach((point, index) => {
    const barX = x + index * barWidth + barWidth / 2
    const openY = y + chartHeight - (point.open / 10) * chartHeight
    const closeY = y + chartHeight - (point.close / 10) * chartHeight
    const highY = y + chartHeight - (point.high / 10) * chartHeight
    const lowY = y + chartHeight - (point.low / 10) * chartHeight

    const isAuspicious = point.trend === '正向'
    const color = isAuspicious ? '#D4AF37' : '#8B0000'
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.lineWidth = 1

    // 绘制上影线
    ctx.beginPath()
    ctx.moveTo(barX, highY)
    ctx.lineTo(barX, Math.min(openY, closeY))
    ctx.stroke()

    // 绘制实体
    const bodyHeight = Math.abs(closeY - openY)
    const bodyY = Math.min(openY, closeY)
    ctx.fillRect(barX - 3, bodyY, 6, Math.max(bodyHeight, 2))

    // 绘制下影线
    ctx.beginPath()
    ctx.moveTo(barX, Math.max(openY, closeY))
    ctx.lineTo(barX, lowY)
    ctx.stroke()

    // 绘制年龄标签（每10岁标注一次）
    if (index % 10 === 0) {
      ctx.fillStyle = '#B3B3B3'
      ctx.font = '18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(point.age.toString(), barX, y + chartHeight + 25)
    }
  })

  // 绘制图例
  const legendY = y + chartHeight + 50
  ctx.fillStyle = '#D4AF37'
  ctx.fillRect(x, legendY, 20, 10)
  ctx.fillStyle = '#F5F0E6'
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('正向', x + 30, legendY + 10)

  ctx.fillStyle = '#8B0000'
  ctx.fillRect(x + 120, legendY, 20, 10)
  ctx.fillStyle = '#F5F0E6'
  ctx.fillText('负向', x + 150, legendY + 10)

  return legendY + 40
}

/**
 * 绘制报告章节（新API）
 */
function drawReportSectionNew(
  ctx: any,
  title: string,
  data: {score: number; content: string},
  x: number,
  y: number,
  width: number
): number {
  // 绘制标题和评分
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${title}（评分：${data.score.toFixed(1)}）`, x, y)
  y += 50

  // 绘制内容（自动换行）
  ctx.fillStyle = '#F5F0E6'
  ctx.font = '22px sans-serif'
  const lines = wrapTextNew(ctx, data.content, width - 40, 22)
  for (const line of lines) {
    ctx.fillText(line, x + 20, y)
    y += 35
  }

  y += 40
  return y
}

/**
 * 文本自动换行（新API）
 */
function wrapTextNew(_ctx: any, text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  // 估算每个字符的宽度（中文字符约等于fontSize，英文约为fontSize/2）
  const estimateWidth = (str: string): number => {
    let width = 0
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      // 判断是否为中文字符
      if (/[\u4e00-\u9fa5]/.test(char)) {
        width += fontSize
      } else {
        width += fontSize / 2
      }
    }
    return width
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const testLine = currentLine + char
    const testWidth = estimateWidth(testLine)

    if (testWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * 绘制K线图
 */
function drawKLineChart(ctx: any, data: KLineDataPoint[], x: number, y: number, width: number): number {
  const chartHeight = 400
  const chartWidth = width

  // 绘制标题
  ctx.setFillStyle('#D4AF37')
  ctx.setFontSize(32)
  ctx.setTextAlign('left')
  ctx.fillText('趋势K线图', x, y)
  y += 50

  // 绘制K线图背景
  ctx.setFillStyle('#2A2A2A')
  ctx.fillRect(x, y, chartWidth, chartHeight)

  // 绘制网格线
  ctx.setStrokeStyle('#3A3A3A')
  ctx.setLineWidth(1)
  for (let i = 0; i <= 10; i += 2) {
    const gridY = y + (chartHeight * (10 - i)) / 10
    ctx.beginPath()
    ctx.moveTo(x, gridY)
    ctx.lineTo(x + chartWidth, gridY)
    ctx.stroke()

    // 绘制Y轴标签
    ctx.setFillStyle('#B3B3B3')
    ctx.setFontSize(20)
    ctx.setTextAlign('right')
    ctx.fillText(i.toString(), x - 10, gridY + 7)
  }

  // 绘制K线
  const barWidth = chartWidth / data.length
  data.forEach((point, index) => {
    const barX = x + index * barWidth + barWidth / 2
    const openY = y + chartHeight - (point.open / 10) * chartHeight
    const closeY = y + chartHeight - (point.close / 10) * chartHeight
    const highY = y + chartHeight - (point.high / 10) * chartHeight
    const lowY = y + chartHeight - (point.low / 10) * chartHeight

    const isAuspicious = point.trend === '正向'
    const color = isAuspicious ? '#D4AF37' : '#8B0000'
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(1)

    // 绘制上影线
    ctx.beginPath()
    ctx.moveTo(barX, highY)
    ctx.lineTo(barX, Math.min(openY, closeY))
    ctx.stroke()

    // 绘制实体
    const bodyHeight = Math.abs(closeY - openY)
    const bodyY = Math.min(openY, closeY)
    ctx.fillRect(barX - 3, bodyY, 6, Math.max(bodyHeight, 2))

    // 绘制下影线
    ctx.beginPath()
    ctx.moveTo(barX, Math.max(openY, closeY))
    ctx.lineTo(barX, lowY)
    ctx.stroke()

    // 绘制年龄标签（每10岁标注一次）
    if (index % 10 === 0) {
      ctx.setFillStyle('#B3B3B3')
      ctx.setFontSize(18)
      ctx.setTextAlign('center')
      ctx.fillText(point.age.toString(), barX, y + chartHeight + 25)
    }
  })

  // 绘制图例
  const legendY = y + chartHeight + 50
  ctx.setFillStyle('#D4AF37')
  ctx.fillRect(x, legendY, 20, 10)
  ctx.setFillStyle('#F5F0E6')
  ctx.setFontSize(20)
  ctx.setTextAlign('left')
  ctx.fillText('正向', x + 30, legendY + 10)

  ctx.setFillStyle('#8B0000')
  ctx.fillRect(x + 120, legendY, 20, 10)
  ctx.setFillStyle('#F5F0E6')
  ctx.fillText('负向', x + 150, legendY + 10)

  return legendY + 40
}

/**
 * 绘制报告章节
 */
function drawReportSection(
  ctx: any,
  title: string,
  data: {score: number; content: string},
  x: number,
  y: number,
  width: number
): number {
  // 绘制标题和评分
  ctx.setFillStyle('#D4AF37')
  ctx.setFontSize(28)
  ctx.setTextAlign('left')
  ctx.fillText(`${title}（评分：${data.score.toFixed(1)}）`, x, y)
  y += 50

  // 绘制内容（自动换行）
  ctx.setFillStyle('#F5F0E6')
  ctx.setFontSize(22)
  const lines = wrapText(ctx, data.content, width - 40, 22)
  for (const line of lines) {
    ctx.fillText(line, x + 20, y)
    y += 35
  }

  y += 40
  return y
}

/**
 * 文本自动换行
 * 注意：Taro的Canvas不支持measureText，需要估算字符宽度
 */
function wrapText(_ctx: any, text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  // 估算每个字符的宽度（中文字符约等于fontSize，英文约为fontSize/2）
  const estimateWidth = (str: string): number => {
    let width = 0
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      // 判断是否为中文字符
      if (/[\u4e00-\u9fa5]/.test(char)) {
        width += fontSize
      } else {
        width += fontSize / 2
      }
    }
    return width
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const testLine = currentLine + char
    const testWidth = estimateWidth(testLine)

    if (testWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}
