import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import i18n from '@vue-storefront/i18n'
import get from 'lodash-es/get'

const validateOrder = checkoutOrder => {
  let sum = checkoutOrder.order_lines.reduce((acc, line) => acc + line.total_amount, 0)
  return checkoutOrder.order_amount === sum
}

const getValue = (attribute, item) => parseFloat(get(item.product, config.klarna.shipping_attributes[attribute], 0)) * item.qty | 0

const getProductUrl = product => {
  const storeView = currentStoreView()
  const productUrl = localizedRoute({
    name: product.type_id + '-product',
    fullPath: product.url_path,
    params: { parentSku: product.parentSku ? product.parentSku : product.sku, slug: product.slug, childSku: product.sku }
  }, storeView.storeCode)
  return router.resolve(productUrl).href
}

const mapProductToKlarna = (sumDimensionOrder) => (product) => {
  const vsfProduct = product.product
  const klarnaProduct: any = {
    name: product.name,
    quantity: product.qty,
    unit_price: Math.round(product.price_incl_tax * 100),
    tax_rate: Math.round(product.tax_percent * 100),
    total_amount: Math.round(product.row_total_incl_tax * 100) - Math.round(product.base_discount_amount * 100),
    total_discount_amount: Math.round((product.discount_amount || 0) * 100),
    total_tax_amount: Math.round(product.tax_amount * 100)
  }
  if (vsfProduct) {
    klarnaProduct.image_url = getThumbnailPath(vsfProduct.image, 600, 600) || ''
    klarnaProduct.reference = vsfProduct.sku
    if (config.klarna.productBaseUrl) {
      klarnaProduct.product_url = config.klarna.productBaseUrl + getProductUrl(vsfProduct)
    }
  }

  if (config.klarna.addShippingAttributes) {
    let weight = getValue('weight', product)
    let height = getValue('height', product) * 10
    let width = getValue('width', product) * 10
    let length = getValue('length', product) * 10

    let tags = []

    if (config.klarna.hasOwnProperty('limitation_shipping_attributes')) {
        config.klarna.limitation_shipping_attributes.forEach((shippingMethod) => {
        const maxWeight = shippingMethod.weight
        const maxHeight = shippingMethod.height
        const maxWidth = shippingMethod.width
        const maxLength = shippingMethod.length

        let checkWeightOnly = false

        if (shippingMethod.hasOwnProperty('check_products_weight_only')) {
          Object.keys(shippingMethod.check_products_weight_only)
            .forEach(function eachKey(key) {
              // Check if product only need to check weight only
              if (shippingMethod.check_products_weight_only[key].includes(product.product[key])) {
                checkWeightOnly = true
              }
            })
        }

        // Currently, Klarna only supports weight for order_lines, this should be updated after Klarna added "order_weight"
        if (checkWeightOnly) {
          if ((parseFloat(sumDimensionOrder.weight) <= maxWeight)) {
            tags.push(shippingMethod.code)
          }
        } else {
          if ((parseFloat(sumDimensionOrder.weight) <= maxWeight  || sumDimensionOrder.height <= maxHeight || sumDimensionOrder.width <= maxWidth || sumDimensionOrder.length <= maxLength )) {
            tags.push(shippingMethod.code)
          }
        }
      })
    }

    klarnaProduct.shipping_attributes = {
      weight: weight,
      dimensions: {
        height: height,  //mm
        width: width, //mm
        length: length //mm
      },
      tags: tags
    }
  }
  return klarnaProduct
}

const mapRedirectUrl = (externalPaymentConfig) => {
  if (externalPaymentConfig.name == 'PayPal')
  {
    let uri = externalPaymentConfig.redirect_url
    const { storeCode } = currentStoreView()
    const { productBaseUrl } = config.klarna
    externalPaymentConfig.redirect_url = `${productBaseUrl}/${storeCode}/${uri}`
  }
  return externalPaymentConfig
}

const getTaxAmount = (totalAmount: number, taxRate: number) => {
  return totalAmount / (1 + (1 / taxRate))
}

export const getters: GetterTree<CheckoutState, RootState> = {
  checkout (state: CheckoutState) {
    return state.checkout
  },
  confirmation (state: CheckoutState) {
    return state.confirmation
  },
  coupon (state, getters, rootState, rootGetters) {
    // renamed to getCoupon in VSF 1.10
    return rootGetters['cart/getCoupon'] || rootGetters['cart/coupon']
  },
  hasTotals (state, getters, rootState) {
    const {platformTotals: totals} = rootState.cart
    const productTotals = rootState.cart.cartItems.every(item => !!item.totals)
    return !!totals && productTotals
  },
  platformTotals (state, getters, rootState) {
    const {platformTotals: totals} = rootState.cart
    return totals || {}
  },
  storageTarget () {
    const storeView = currentStoreView()
    const dbNamePrefix = storeView.storeCode ? storeView.storeCode + '-kco' : 'kco'
    return `${dbNamePrefix}/id`
  },
  order (state: CheckoutState, getters, rootState, rootGetters) {
    const storeView: any = currentStoreView()
    const shippingMethods = rootState.shipping.methods
    const cartItems = rootGetters['cart/items']
    const {platformTotals: totals} = rootState.cart
    if (!getters.hasTotals) {
      return {
        error: true,
        reason: 'Missing totals'
      }
    }

    const trueCartItems = totals.items.map(item => {
      const newItem = {...item}
      const vsfitem = cartItems.find(_item => _item.totals.item_id === item.item_id)
      if (vsfitem) {
        newItem.product = vsfitem
      }
      return newItem
    })
    const external_payment_methods = config.klarna.external_payment_methods ? config.klarna.external_payment_methods.map(mapRedirectUrl) : null;
    const external_checkouts = config.klarna.external_checkouts ? config.klarna.external_checkouts : null;

    //update translate
    const klarnaOptions = config.klarna.options
    if (klarnaOptions && klarnaOptions.additional_checkboxes) {
      klarnaOptions.additional_checkboxes.forEach(checkbox => {
        if (checkbox.id === 'newsletter_opt_in') {
          checkbox.text = i18n.t(checkbox.text)
        }
      })
    }

    // Prefill purchaseCountry
    let purchaseCountry = state.purchaseCountry || storeView.i18n.defaultCountry
    if (storeView.shipping_countries && !storeView.shipping_countries.includes(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
    if (!/^[A-Za-z]{2,2}$/.test(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
    let weightOrder = 0
    let lengthOrder = 0
    let heightOrder= 0
    let widthOrder = 0

    trueCartItems.forEach((item) => {
      weightOrder += getValue('weight', item)
      lengthOrder += getValue('length', item) * 10
      heightOrder += getValue('height', item) * 10
      widthOrder +=  getValue('width', item) * 10
    })

    let sumDimensionOrder = {
      weight: weightOrder.toFixed(2),
      height: heightOrder,
      length: lengthOrder,
      width: widthOrder
    }

    const checkoutOrder: any = {
      purchase_country: purchaseCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      shipping_countries: storeView.shipping_countries || [],
      order_lines: trueCartItems.map(mapProductToKlarna(sumDimensionOrder)),
      order_amount: Math.round(totals.base_grand_total * 100),
      order_tax_amount: Math.round(totals.base_tax_amount * 100),
      external_payment_methods,
      external_checkouts,
      options: klarnaOptions ? klarnaOptions : null,
      merchant_data: JSON.stringify(state.merchantData)
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (config.klarna.showShippingOptions && state.shippingOptions) {
      checkoutOrder.order_amount = Math.round((totals.base_grand_total - totals.base_shipping_incl_tax) * 100)
      checkoutOrder.order_tax_amount = Math.round((totals.base_tax_amount - totals.base_shipping_tax_amount) * 100)
      checkoutOrder.shipping_options = shippingMethods.map((method, index: number) => {
        const price = method.price_incl_tax || method.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(price, shippingTaxRate)
        return {
          id: method.method_code,
          name: `${method.method_title}`,
          price: price ? Math.round(price * 100) : 0,
          tax_amount: taxAmount ? Math.round(taxAmount * 100) : 0,
          tax_rate: shippingTaxRate ? Math.round(shippingTaxRate * 10000) : 0,
          preselected: index === 0
        }
      })
    }

    const { shippingMethod: code } = rootState.checkout.shippingDetails
    let shippingMethod = rootGetters['shipping/shippingMethods']
      .find(method => method.method_code === code)
    if (shippingMethod) {
      const price = totals.shipping_incl_tax
      const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
      const taxAmount = getTaxAmount(totals.shipping_incl_tax, shippingTaxRate)
      checkoutOrder.order_amount = Math.round((totals.base_grand_total) * 100)
      checkoutOrder.order_tax_amount = Math.round((totals.base_tax_amount) * 100)
      checkoutOrder.order_lines.push({
        type: 'shipping_fee',
        quantity: 1,
        name: `${shippingMethod.carrier_title} (${shippingMethod.method_title})`,
        total_amount: price ? price * 100 : 0,
        unit_price: price ? price * 100 : 0,
        total_tax_amount: taxAmount ? taxAmount * 100 : 0,
        tax_rate: shippingTaxRate ? shippingTaxRate * 10000: 0
      })
    } else {
      let selectedShippingMethod = localStorage.getItem('shipping_method')
      if (selectedShippingMethod) {
        let selectedOption = JSON.parse(selectedShippingMethod)

        checkoutOrder.order_lines.push({
          type: 'shipping_fee',
          quantity: 1,
          name: selectedOption.name,
          total_amount: selectedOption.price,
          unit_price: selectedOption.price,
          total_tax_amount: selectedOption.tax_amount,
          tax_rate: selectedOption.tax_rate
        })
        checkoutOrder.selected_shipping_option = selectedOption

        let orderAmount = 0
        let orderTaxAmount = 0
        checkoutOrder.order_lines.forEach((orderLine) => {
          orderAmount += orderLine.total_amount
          orderTaxAmount += orderLine.total_tax_amount
        })

        checkoutOrder.order_amount = Math.round(orderAmount)

        checkoutOrder.order_tax_amount = Math.round(orderTaxAmount)

      }
    }

    if (!validateOrder(checkoutOrder)) {
      return {
        error: true,
        reason: 'Order amount incorrect'
      }
    }
    return checkoutOrder
  }
}
