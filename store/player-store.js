import { HYEventStore } from 'hy-event-store'
import { getSongDetail, getSongLyric } from '../service/api_player'
import { parseLyric } from '../utils/parse-lyric'

// const audioContext = wx.createInnerAudioContext()
const audioContext = wx.getBackgroundAudioManager()

const playerStore = new HYEventStore({
  state: {
    isFirstPlay: true,
    isStoping: false,
    id: 0,
    currentSong: {},
    durationTime: 0,
    lyricInfos: [],

    currentTime: 0,
    currentLyricIndex: 0,
    currentLyricText: "",

    playModeIndex: 0,  // 0：循环播放   1: 单曲循环   2: 随机播放

    isPlaying: false,

    playListSongs: [],
    playListIndex: 0
  },
  actions: {
    playMusicWithSongIdAction(ctx, { id, isRefresh = false }) {
      if (ctx.id === id && !isRefresh) {
        this.dispatch("changeMusicPlayStatusAction", true)
        return
      }
      ctx.id = id

      // 换歌 重置数据
      ctx.currentSong = {}
      ctx.durationTime = 0
      ctx.lyricInfos = []
      ctx.currentTime = 0
      ctx.currentLyricIndex = 0
      ctx.currentLyricText = ""

      // 请求歌曲详情
      getSongDetail(id).then(res => {
        ctx.currentSong = res.songs[0]
        ctx.durationTime = res.songs[0].dt
        audioContext.title = res.songs[0].name
      })
      // 请求歌词数据
      getSongLyric(id).then(res => {
        const lyricString = res.lrc.lyric
        const lyrics = parseLyric(lyricString)
        ctx.lyricInfos = lyrics
      })

      // 播放对应 id 的歌曲
      audioContext.stop()
      audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
      audioContext.title = id
      audioContext.autoplay = true
      
      // 修改播放状态
      ctx.isPlaying = true
      
      // 监听 audioContext
      if (ctx.isFirstPlay) {
        this.dispatch("setupAudioContextListenerAction")
        ctx.isFirstPlay = false
      }

    },

    setupAudioContextListenerAction(ctx) {
      // 监听歌曲可以播放
      audioContext.onCanplay(() => {
        audioContext.play()
      })
      // 监听歌曲时间改变
      audioContext.onTimeUpdate(() => {
        // 获取当前时间
        const currentTime = audioContext.currentTime * 1000
        
        // 根据当前时间修改 currentTime
        ctx.currentTime = currentTime

        // 根据当前时间去查找播放的歌词
        if (!ctx.lyricInfos.length) return
        let i = 0
        for (; i < ctx.lyricInfos.length; i++) {
          const lyricInfo = ctx.lyricInfos[i]
          if (currentTime < lyricInfo.time) {
            break
          }
        }
        const currentIndex = i - 1
        if (ctx.currentLyricIndex !== currentIndex) {
          const currentLyricInfo = ctx.lyricInfos[currentIndex]
          ctx.currentLyricIndex = currentIndex
          ctx.currentLyricText = currentLyricInfo.text
        }
      })
      // 监听歌曲播放完成
      audioContext.onEnded(() => {
        this.dispatch("changeNewMusicNextAction")
      })

      // 监听音乐 暂停 / 播放 / 停止
      // 播放状态
      audioContext.onPlay(() => {
        ctx.isPlaying = true
      })
      // 暂停状态
      audioContext.onPause(() => {
        ctx.isPlaying = false
      })
      // 停止状态
      audioContext.onStop(() => {
        ctx.isPlaying = false
        ctx.isStoping = true
      })
    },
    // 播放 / 暂停
    changeMusicPlayStatusAction(ctx, isPlaying = true) {
      ctx.isPlaying = isPlaying
      if (ctx.isPlaying && ctx.isStoping) {
        audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`
        audioContext.seek(ctx.currentTime / 1000)
        audioContext.title = currentSong.name
        ctx.isStoping = false
      }
      ctx.isPlaying ? audioContext.play() : audioContext.pause()
    },
    // 下一首
    changeNewMusicNextAction(ctx) {
      // 获取当前索引
      let index = ctx.playListIndex
      switch(ctx.playModeIndex) {
        case 0: // 顺序
          index = index + 1
          if (index === ctx.playListSongs.length) index = 0
          break
        case 1: // 单曲
          break
        case 2: // 随机
          index = Math.floor(Math.random() * ctx.playListSongs.length)
          break
      }

      // 获取歌曲
      const currentSong = ctx.playListSongs[index]
      if (!currentSong) {
        currentSong = ctx.currentSong
      } else {
        // 记录最新的索引
        ctx.playListIndex = index
      }

      // 播放新的歌曲
      this.dispatch("playMusicWithSongIdAction", {
        id: currentSong.id,
        isRefresh: true
      })
    },
    // 上一首
    changeNewMusicPrevAction(ctx) {
      // 获取当前索引
      let index = ctx.playListIndex
      switch(ctx.playModeIndex) {
        case 0: // 顺序
          index = index - 1
          if (index === -1) index = ctx.playListSongs.length - 1
          break
        case 1: // 单曲
          break
        case 2: // 随机
          index = Math.floor(Math.random() * ctx.playListSongs.length)
          break
      }
  
      // 获取歌曲
      const currentSong = ctx.playListSongs[index]
      if (!currentSong) {
        currentSong = ctx.currentSong
      } else {
        // 记录最新的索引
        ctx.playListIndex = index
      }
  
      // 播放新的歌曲
      this.dispatch("playMusicWithSongIdAction", {
        id: currentSong.id,
        isRefresh: true
      })
    }

  }
})

export {
  audioContext,
  playerStore
}
