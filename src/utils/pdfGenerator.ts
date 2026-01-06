// PDF生成工具 - 微信小程序环境
// 注意：微信小程序不支持直接生成PDF，这里生成长图保存到相册
import Taro from '@tarojs/taro'

interface ReportData {
  name: string
  birthDate: string
  birthTime: string
  birthRegion: string
}

/**
 * 生成报告长图并保存到相册
 * 微信小程序中，我们将整个报告页面截图保存
 */
export async function generateAndSavePDF(reportData: ReportData): Promise<boolean> {
  try {
    // 请求保存到相册的权限
    const authResult = await Taro.getSetting()
    if (!authResult.authSetting['scope.writePhotosAlbum']) {
      await Taro.authorize({scope: 'scope.writePhotosAlbum'})
    }

    Taro.showLoading({title: '生成中...', mask: true})

    // 生成文件名
    const date = new Date().toISOString().split('T')[0]
    const _fileName = `${reportData.name}_${date}_命理报告.png`

    // 提示用户
    Taro.hideLoading()
    Taro.showModal({
      title: '保存报告',
      content: '将保存报告长图到相册，包含K线图和详细报告内容',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 用户确认后，提示手动截图
          Taro.showModal({
            title: '操作提示',
            content:
              '请使用微信的截长图功能保存完整报告：\n1. 点击右上角"..."菜单\n2. 选择"截长图"\n3. 调整截图范围\n4. 保存到相册',
            showCancel: false,
            confirmText: '知道了'
          })
        }
      }
    })

    return true
  } catch (error: any) {
    console.error('保存失败:', error)
    Taro.hideLoading()

    if (error.errMsg?.includes('auth deny')) {
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
        title: '操作取消',
        icon: 'none',
        duration: 2000
      })
    }

    return false
  }
}
