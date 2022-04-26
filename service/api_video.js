import request from '../service/index'

export function getTopMV(offset, limit = 10) {
  return request.get("/top/mv", {
    offset,
    limit
  })
}

// 请求MV的播放地址
export function getMvUrl(id) {
  return request.get("/mv/url", { id })
}

// 请求MV的详情
export function getMvDetail(mvid) {
  return request.get('/mv/detail', { mvid })
}

export function getRelateVideo(id) {
  return request.get('/related/allvideo', { id })
}

