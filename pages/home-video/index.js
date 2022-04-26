// pages/home-video/index.js
import { getTopMV } from '../../service/api_video'
Page({
  data: {
    topMVs: [],
    hasMore: true
  },

  onLoad: async function (options) {
    this.getTopMVData(0)
  },
  
  // 封装网络请求方法
  getTopMVData: async function (offset) {
    // 判断是否可以请求
    if (!this.data.hasMore) return

    // 请求开始 => 展示加载动画
    wx.showNavigationBarLoading()

    const res = await getTopMV(offset)
    let newData = this.data.topMVs
    if (offset === 0) {
      newData = res.data
    } else {
      newData = [ ...newData, ...res.data ]
    }
    this.setData({  
      topMVs: newData,
      hasMore: res.hasMore
    }) 
    // 请求结束 => 隐藏动画
    wx.hideNavigationBarLoading()
    if (offset === 0) {
      wx.stopPullDownRefresh()
    }
  },

  // 封装事件处理方法
  handleVideoItemClick: function (e) {
    const id = e.currentTarget.dataset.item.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/detail-video/index?id=' + id,
    })
  },

  // 触底加载
  onReachBottom: async function () {
    this.getTopMVData(this.data.topMVs.length)
  },

  // 下拉刷新
  onPullDownRefresh: async function () {
    if(!this.data.hasMore) {
      this.setData({  hasMore: true  })
    }
    this.getTopMVData(0)
  }
})