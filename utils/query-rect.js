export default function (selector) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery()
    query.select(selector).boundingClientRect()
    query.exec(resolve)
    // query.exec((res) => {
    //   const rect = res[0]
    //   resolve(rect)
    // })
  })
}