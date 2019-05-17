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
  window['_klarnaCheckout']((api) => {
    callback(api)
    resolve()
  })
})

const calculateTotalAmount = (product) => {
  return (product.qty * (product.priceInclTax * 100)) - (product.totals.discount_amount * 100)
}

export const mapProductToKlarna = product => {
  console.log('product', product)
  return {
    reference: product.sku,
    name: product.name,
    quantity: product.qty,
    unit_price: product.priceInclTax * 100,
    tax_rate: product.priceTax / product.priceInclTax * 10000,
    total_amount: calculateTotalAmount(product),
    total_discount_amount: product.totals.discount_amount * 100,
    total_tax_amount: calculateTotalAmount(product) - calculateTotalAmount(product) * 10000 / (10000 + product.totals.tax_percent * 100)
  }
}

export const calculateShippingTaxRate = (shippingInformation) => {
  const {
    shipping_amount: shippingAmount,
    shipping_incl_tax: shippingAmountInclTax
  } = shippingInformation.platformTotals

  const shippingTaxRateFormatted = (((shippingAmountInclTax - shippingAmount) / shippingAmount) * 100) * 100
  return shippingTaxRateFormatted
}
