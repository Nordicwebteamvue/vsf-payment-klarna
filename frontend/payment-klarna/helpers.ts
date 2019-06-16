export const getScriptTagsFromSnippet = (snippet) => {
  const dummy = document.createElement('div')
  dummy.innerHTML = snippet
  const scriptsTags = dummy.querySelectorAll('script')
  return scriptsTags
}

export const callApi = (callback: (api: any) => {}) => new Promise((resolve) => {
  window['_klarnaCheckout']((api: any) => {
    callback(api)
    resolve()
  })
})
