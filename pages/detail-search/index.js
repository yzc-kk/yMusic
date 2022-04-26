// pages/detail-search/index.js
import { getSearchHot, getSearchSuggest, getSearchResult } from '../../service/api_search'
import debounce from '../../utils/debounce'
import stringToNodes from '../../utils/stringToNodes'

const debounceGetSearchSuggest = debounce(getSearchSuggest, 300)
Page({

  data: {
    searchValue: '',
    hotKeywords: [],
    suggestSongs: [],
    suggestSongsNodes: [],
    resultSongs: []
  },

  onLoad: function (options) {
    // 获取页面的数据
    this.getPageData()
  },

  getPageData: function () {
    getSearchHot().then(res => {
      this.setData({ hotKeywords: res.result.hots })
    })
  },

  // 事件处理
  handleSearchChange: function (e) {
    // 获取输入的关键字
    const searchValue = e.detail
    this.setData({ searchValue })

    if (searchValue.length == 0) {
      this.setData({ 
        suggestSongs: [],
        suggestSongsNodes: [],
        resultSongs: []
      })
      // 取消
      debounceGetSearchSuggest.cancel()
      return
    }
    // 根据关键字搜索 => 防抖
    debounceGetSearchSuggest(searchValue).then(res => {
      // 获取建议的关键字歌曲
      const suggestSongs = res.result.allMatch
      this.setData({ suggestSongs })
      if (!suggestSongs) return
      // 转成 nodes 节点
      const suggestKeywords = suggestSongs.map(item => item.keyword)
      const suggestSongsNodes = []
      for (const keyword of suggestKeywords) {
        const nodes = stringToNodes(keyword, searchValue)
        suggestSongsNodes.push(nodes)
      }
      this.setData({ suggestSongsNodes })
    })
    
  },

  handleSearchAction: function () {
    const searchValue = this.data.searchValue
    getSearchResult(searchValue).then(res => {
      this.setData({
        resultSongs: res.result.songs
      })
    })
  },

  // 点击搜索结果
  // 点击热门搜索某个字段
  handleKeywordItemClick: function (e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchValue: keyword })
    this.handleSearchAction()
  },

  onUnload: function () {

  }

})