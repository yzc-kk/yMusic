// pages/music-player/index.js

import { audioContext, playerStore } from '../../store/index'
const playModeNames = ["order", "repeat", "random"]
Page({

  data: {
    id: "",
    currentSong: {},
    durationTime: 0,
    lyricInfos: [],
    
    currentTime: 0,
    currentLyricIndex: 0,
    currentLyricText: "",

    currentPage: 0,
    contentHeight: 0,

    sliderValue: 0,
    isSliderChanging: false,

    isMusicLyric: true,
    lyricScrollTop: 0,

    isPlaying: false,
    playingName: "pause",

    playModeIndex: 0,
    playModeName: "order"
  },

  onLoad(options) {
    const id = options.id
    this.setData({ id })

    // 根据 id 获取歌曲信息
    this.setupPlayStoreListener()

    // 动态计算内容高度
    const globalData = getApp().globalData
    const screenHeight = globalData.screenHeight
    const statusBarHeight = globalData.statusBarHeight
    const navBarHeight = globalData.navBarHeight
    const deviceRadio = globalData.deviceRadio

    const contentHeight = screenHeight - statusBarHeight - navBarHeight
    this.setData({ 
      contentHeight,
      isMusicLyric: deviceRadio >= 2
    })
  },

  // 事件处理
  handleSwiperChange: function (e) {
    const currentPage = e.detail.current
    this.setData({ currentPage })
  },
  
  handleSliderChange: function(event) {
    // 1.获取slider变化的值
    const value = event.detail.value

    // 2.计算需要播放的currentTIme
    const currentTime = this.data.durationTime * value / 100

    // 3.设置context播放currentTime位置的音乐
    // audioContext.pause()
    audioContext.seek(currentTime / 1000)

    // 4.记录最新的sliderValue, 并且需要讲isSliderChaning设置回false
    this.setData({ sliderValue: value, isSliderChanging: false })
  },

  handleSliderChanging: function(event) {
    const value = event.detail.value
    const currentTime = this.data.durationTime * value / 100
    this.setData({ isSliderChanging: true, currentTime })
  },
  
  handleBackBtnClick: function () {
    wx.navigateBack()
  },

  // 数据监听
  setupPlayStoreListener: function () {
    playerStore.onStates(["currentSong", "durationTime", "lyricInfos"], ({
      currentSong,
      durationTime,
      lyricInfos
    }) => {
      if (currentSong) this.setData({ currentSong })
      if (durationTime) this.setData({ durationTime })
      if (lyricInfos) this.setData({ lyricInfos })
    })

    // 监听 currentTime
    playerStore.onStates(["currentTime", "currentLyricIndex", "currentLyricText"], ({
      currentTime,
      currentLyricIndex,
      currentLyricText
    }) => {
      // 时间变化
      if (currentTime && !this.data.isSliderChanging) {
        const sliderValue = currentTime / this.data.durationTime * 100
        this.setData({ currentTime, sliderValue })
      }
      // 歌词变化
      if (currentLyricIndex) {
        this.setData({ 
          currentLyricIndex,
          lyricScrollTop: currentLyricIndex * 35
        })
      }
      if (currentLyricText) this.setData({ currentLyricText })
    })

    // 监听播放模式相关的数据
    playerStore.onStates(["playModeIndex", "isPlaying"], ({
      playModeIndex,
      isPlaying
    }) => {
      if (playModeIndex !== undefined) {
        this.setData({ 
          playModeIndex,
          playModeName: playModeNames[playModeIndex]
        })
      }
      if (isPlaying !== undefined) {
        this.setData({
          isPlaying,
          playingName: isPlaying ? "pause": "resume"
        })
      }
    })

  },

  // 切换播放模式
  handleModeBtnClick: function () {
    // 计算最新的playModeIndex
    let playModeIndex = this.data.playModeIndex + 1
    if (playModeIndex === 3) playModeIndex = 0

    // 设置 playerStore 中的 playModeIndex
    playerStore.setState("playModeIndex", playModeIndex)
  },
  // 播放 / 暂停
  handlePlayBtnClick: function () {
    playerStore.dispatch("changeMusicPlayStatusAction", !this.data.isPlaying)
  },

  // 上一首
  handlePrevBtnClick: function () {
    playerStore.dispatch("changeNewMusicPrevAction")
  },
  // 下一首
  handleNextBtnClick: function () {
    playerStore.dispatch("changeNewMusicNextAction")
  },

  onUnload() {

  }
})