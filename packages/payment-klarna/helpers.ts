export const callApi = (callback: (api: any) => {}) => new Promise((resolve) => {
  window['_klarnaCheckout']((api: any) => {
    callback(api)
    resolve()
  })
})
