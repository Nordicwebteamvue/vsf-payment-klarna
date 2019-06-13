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

export const calculateTotalAmount = (product) => {
  return (product.qty * (product.priceInclTax * 100)) - (product.totals.discount_amount * 100)
}

export const calculateTotalTaxAmount = (product) => {
  const totalAmount = calculateTotalAmount(product)
  return (totalAmount - totalAmount  * 10000 / (10000 + product.totals.tax_percent * 100))
}

export const calculateShippingTaxRate = (shippingInformation) => {
  const {
    shipping_amount: shippingAmount,
    shipping_incl_tax: shippingAmountInclTax
  } = shippingInformation.platformTotals

  const shippingTaxRateFormatted = (((shippingAmountInclTax - shippingAmount) / shippingAmount) * 100) * 100
  return shippingTaxRateFormatted
}
