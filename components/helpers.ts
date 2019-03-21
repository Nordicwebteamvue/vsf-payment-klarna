export const post = (url, body) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
}).then(res => res.json())

export const getScriptTagsFromSnippet = (snippet) => {
  const dummy = document.createElement('div')
  dummy.innerHTML = snippet
  const scriptsTags = dummy.querySelectorAll('script')
  return scriptsTags
}

export const callApi = (callback) => new Promise((resolve, reject) => {
  window._klarnaCheckout((api) => {
    callback(api)
    resolve()
  })
})
