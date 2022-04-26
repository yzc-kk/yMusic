import request from '../service/index'

export function getBanners() {
  return request.get('/banner', { type: 2 })
}

export function getRankings(idx) {
  return request.get('/top/list', { idx })
}

// cat -> category 类别
export function getSongMenu(cat="全部", limit=6, offset=0) {
  return request.get("/top/playlist", {
    cat,
    limit,
    offset
  })
}

export function getSongMenuDetail(id) {
  return request.get("/playlist/detail/dynamic", {
    id
  })
}
