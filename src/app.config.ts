const pages = [
  'pages/index/index',
  'pages/chart/index',
  'pages/report/index',
  'pages/history/index',
  'pages/profile/index',
  'pages/chart-fullscreen/index'
]

export default defineAppConfig({
  pages,
  tabBar: {
    color: '#666666',
    selectedColor: '#D4AF37',
    backgroundColor: '#F5F0E6',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/images/unselected/home.png',
        selectedIconPath: './assets/images/selected/home.png'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史',
        iconPath: './assets/images/unselected/history.png',
        selectedIconPath: './assets/images/selected/history.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/images/unselected/profile.png',
        selectedIconPath: './assets/images/selected/profile.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F5F0E6',
    navigationBarTitleText: '人生趋势图谱',
    navigationBarTextStyle: 'black'
  },
  permission: {
    'scope.camera': {
      desc: '用于拍摄面部照片，辅助数据分析'
    },
    'scope.album': {
      desc: '用于选择面部照片，辅助数据分析'
    }
  }
})
