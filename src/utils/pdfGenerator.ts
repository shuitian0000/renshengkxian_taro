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
    // 请求保存到相册的权限
    const authResult = await Taro.getSetting()
    if (!authResult.authSetting['scope.writePhotosAlbum']) {
      try {
        await Taro.authorize({scope: 'scope.writePhotosAlbum'})
      } catch (_authError) {
        // 用户拒绝授权，引导去设置
        const modalRes = await Taro.showModal({
          title: '需要授权',
          content: '需要您授权保存图片到相册，才能保存报告',
          confirmText: '去设置',
          cancelText: '取消'
        })
        if (modalRes.confirm) {
          await Taro.openSetting()
        }
        return false
      }
    }

    Taro.showLoading({title: '生成中...', mask: true})

    // 创建离屏Canvas
    const canvas: any = Taro.createOffscreenCanvas({type: '2d', width: 750, height: 4000})
    const ctx: any = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }

    // 设置Canvas尺寸
    const width = 750
    let currentY = 0

    // 绘制背景
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(0, 0, width, 4000)

    // 绘制标题
    currentY = 60
    ctx.fillStyle = '#D4AF37'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('人生K线图谱命理报告', width / 2, currentY)
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
    currentY = drawKLineChart(ctx, reportData.klineData, 60, currentY, width - 120)
    currentY += 80

    // 绘制命理报告各章节
    const sections = [
      {title: '命理总评', data: reportData.reportData.summary},
      {title: '性格分析', data: reportData.reportData.personality},
      {title: '事业分析', data: reportData.reportData.career},
      {title: '财富分析', data: reportData.reportData.wealth},
      {title: '婚姻分析', data: reportData.reportData.marriage},
      {title: '健康分析', data: reportData.reportData.health},
      {title: '六亲分析', data: reportData.reportData.family},
      {title: '风水建议', data: reportData.reportData.fengshui}
    ]

    for (const section of sections) {
      currentY = drawReportSection(ctx, section.title, section.data, 60, currentY, width - 120)
    }

    // 绘制免责声明
    currentY += 40
    ctx.fillStyle = '#D4AF37'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('免责声明', 60, currentY)
    currentY += 40
    ctx.fillStyle = '#B3B3B3'
    ctx.font = '20px sans-serif'
    const disclaimerLines = wrapText(
      ctx,
      '本报告基于中国传统命理学理论生成，仅供参考娱乐，不构成任何决策依据。人生运势受多种因素影响，建议理性看待，积极进取。',
      width - 120
    )
    for (const line of disclaimerLines) {
      ctx.fillText(line, 60, currentY)
      currentY += 35
    }

    currentY += 60

    // 调整Canvas实际高度
    const finalHeight = currentY
    const finalCanvas: any = Taro.createOffscreenCanvas({type: '2d', width, height: finalHeight})
    const finalCtx: any = finalCanvas.getContext('2d')
    if (finalCtx) {
      finalCtx.drawImage(canvas, 0, 0)
    }

    // 导出图片
    const tempFilePath = finalCanvas.toDataURL()

    // 保存到相册
    await Taro.saveImageToPhotosAlbum({
      filePath: tempFilePath
    })

    Taro.hideLoading()
    Taro.showToast({
      title: '已保存到相册',
      icon: 'success',
      duration: 2000
    })

    return true
  } catch (error: any) {
    console.error('生成报告失败:', error)
    Taro.hideLoading()

    if (error.errMsg?.includes('saveImageToPhotosAlbum:fail auth deny')) {
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
        title: error.message || '生成失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }

    return false
  }
}

/**
 * 绘制K线图
 */
function drawKLineChart(ctx: any, data: KLineDataPoint[], x: number, y: number, width: number): number {
  const chartHeight = 400
  const chartWidth = width

  // 绘制标题
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('运势K线图', x, y)
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

    const isAuspicious = point.trend === '吉'
    ctx.fillStyle = isAuspicious ? '#D4AF37' : '#8B0000'
    ctx.strokeStyle = isAuspicious ? '#D4AF37' : '#8B0000'
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
  ctx.fillText('吉运', x + 30, legendY + 10)

  ctx.fillStyle = '#8B0000'
  ctx.fillRect(x + 120, legendY, 20, 10)
  ctx.fillStyle = '#F5F0E6'
  ctx.fillText('凶运', x + 150, legendY + 10)

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
  ctx.fillStyle = '#D4AF37'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${title}（评分：${data.score.toFixed(1)}）`, x, y)
  y += 50

  // 绘制内容（自动换行）
  ctx.fillStyle = '#F5F0E6'
  ctx.font = '22px sans-serif'
  const lines = wrapText(ctx, data.content, width - 40)
  for (const line of lines) {
    ctx.fillText(line, x + 20, y)
    y += 35
  }

  y += 40
  return y
}

/**
 * 文本自动换行
 */
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine.length > 0) {
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
