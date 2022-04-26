// pages/detaill-video/index.js
import { getMvUrl, getMvDetail, getRelateVideo } from '../../service/api_video'
Page({

  data: {
    mvUrlInfo: {},
    mvDetail: {},
    relatedVideos: []
  },

  onLoad: function (options) {
    // 1.获取传入的 id
    const id = options.id
    // 2.获取页面的数据
    this.getPageData(id)
  },
  // 获取页面的数据
  getPageData: function(id) {
    // 1.请求播放地址
    getMvUrl(id).then(res => {
      this.setData({ mvUrlInfo: res.data })
    })
    // 2.请求视频信息
    getMvDetail(id).then(res => {
      this.setData({ mvDetail: res.data })
    })
    // 3.请求相关视频
    getRelateVideo(id).then(res => {
      this.setData({ relatedVideos: res.data })
    })
  }
})