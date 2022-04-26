// pages/home-muisc/index.js

import { getBanners, getSongMenu } from '../../service/api_music'
import queryRect from '../../utils/query-rect'
import throttle from '../../utils/throttle'
import { rankingStore, rankingMap, playerStore } from '../../store/index'

const throttleQueryRect = throttle(queryRect, 100, { trailing: true })
Page({

  data: {
    swiperHeight: 0,  // 轮播图 => 高度
    banners: [],      // 轮播图 => 数据
    recommendSongs: [], // 推荐歌曲
    hotSongMenu: [],  // 热门歌单
    recommendSongMenu: [],  // 推荐歌单
    rankings: { 0: {}, 2: {}, 3: {} }, // 巅峰榜

    currentSong: {},
    isPlaying: false,
    playAnimState: "paused"
  },

  onLoad: function (options) {
    // 获取页面数据
    this.getPageData()

    // 发起共享数据请求
    rankingStore.dispatch("getRankingDataAction")

    // 从store获取共享数据
    rankingStore.onState("hotRanking", (res) => {
      if (!res.tracks) return
      const recommendSongs = res.tracks.slice(0, 6)
      this.setData({ recommendSongs })
    })
    
    rankingStore.onState("newRanking", this.getRankingHandler(0))
    rankingStore.onState("originRanking", this.getRankingHandler(2))
    rankingStore.onState("upRanking", this.getRankingHandler(3))

    // 播放器监听
    playerStore.onStates(["currentSong", "isPlaying"], ({ currentSong, isPlaying }) => {
      if (currentSong) this.setData({ currentSong })
      if (isPlaying !== undefined) {
        this.setData({ 
          isPlaying,
          playAnimState: isPlaying ? "running" : "paused"
        })
      }
    }) 
  },

  // 网络请求
  getPageData: function () {
    getBanners().then(res => {
      this.setData({ banners: res.banners })
    })

    getSongMenu().then(res => {
      this.setData({ hotSongMenu: res.playlists })
    }) 

    getSongMenu("华语").then(res => {
      this.setData({ recommendSongMenu: res.playlists })
    })
  },
  
  // 点击搜索框事件
  handleSearchClick: function () {
    wx.navigateTo({
      url: '/pages/detail-search/index',
    })
  },

  // 动态设置轮播图 => 图片的高度
  handleSwiperImageLoaded: function (e) {
    throttleQueryRect('.swiper-image').then(res => {
      const rect = res[0]
      this.setData({ swiperHeight: rect.height })
    }) 
  },

  // 获取更多
  handleMoreClick: function () {
    this.navigateToDetailSongsPage("hotRanking")
  },

  // 点击 巅峰榜 某一栏
  handleRankingItemClick: function (e) {
    const idx = e.currentTarget.dataset.idx
    const rankingName = rankingMap[idx]
    this.navigateToDetailSongsPage(rankingName)
  },

  navigateToDetailSongsPage: function (rankingName) {
    wx.navigateTo({
      url: `/pages/detail-songs/index?ranking=${rankingName}&type=rank`,
    })
  },

  onUnload: function () {
    rankingStore.offState("newRanking", this.getNewRankingHandler)
  },

  // 根据 idx 获取巅峰榜数据  
  getRankingHandler: function (idx) {
    return (res) => {
      if (Object.keys(res).length === 0) return
      const name = res.name
      const coverImgUrl = res.coverImgUrl
      const playCount = res.playCount
      const songList = res.tracks.slice(0, 3)
      const rankingObj = { name, coverImgUrl, playCount, songList }
      const newRankings = { ...this.data.rankings, [idx]: rankingObj}
      this.setData({
        rankings: newRankings
      })
    }
  },

  handleSongItemClick: function (e) {
    const index = e.currentTarget.dataset.index
    playerStore.setState("playListSongs", this.data.recommendSongs)
    playerStore.setState("playListIndex", index)
  },

  handlePlayBtnClick: function () {
    playerStore.dispatch("changeMusicPlayStatusAction", !this.data.isPlaying)
  },
  handlePlayBarClick: function () {
    wx.navigateTo({
      url: '/pages/music-player/index?id=' + this.data.currentSong.id,
    })
  }
})