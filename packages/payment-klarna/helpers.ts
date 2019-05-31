export const getScriptTagsFromSnippet = (snippet) => {
  const dummy = document.createElement('div')
  dummy.innerHTML = snippet
  const scriptsTags = dummy.querySelectorAll('script')
  return scriptsTags
}

export const callApi = (callback) => new Promise((resolve, reject) => {
  window['_klarnaCheckout']((api) => {
    callback(api)
    resolve()
  })
})

const calculateTotalAmount = (product) => {
  return (product.qty * (product.priceInclTax * 100)) - (product.totals.discount_amount * 100)
}

const calculateTotalTaxAmount = (product) => {
  const totalAmount = calculateTotalAmount(product)
  return (totalAmount - totalAmount  * 10000 / (10000 + product.totals.tax_percent * 100))
}

export const mapProductToKlarna = product => ({
  reference: product.sku,
  name: product.name,
  quantity: product.qty,
  unit_price: product.priceInclTax * 100,
  tax_rate: product.totals.tax_percent * 100,
  total_amount: calculateTotalAmount(product),
  total_discount_amount: product.totals.discount_amount * 100,
  total_tax_amount: calculateTotalTaxAmount(product)
})

export const calculateShippingTaxRate = (shippingInformation) => {
  const {
    shipping_amount: shippingAmount,
    shipping_incl_tax: shippingAmountInclTax
  } = shippingInformation.platformTotals

  const shippingTaxRateFormatted = (((shippingAmountInclTax - shippingAmount) / shippingAmount) * 100) * 100
  return shippingTaxRateFormatted
}
