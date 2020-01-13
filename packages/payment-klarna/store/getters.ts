import { GetterTree } from 'vuex'
import CheckoutState, { KlarnaOrder } from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import get from 'lodash-es/get'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem'

const validateOrder = checkoutOrder => {
  let sum = checkoutOrder.order_lines.reduce((acc, line) => acc + line.total_amount, 0)
  console.log('checkoutOrder.order_amount === sum', checkoutOrder.order_amount, sum)
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

const mapProductToKlarna = (product) => {
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
  return klarnaProduct
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
  getTrueCartItems(state: CheckoutState, getters, rootState, rootGetters) {
    const cartItems: Array<CartItem> = Array.from(rootGetters['cart/getCartItems'])
    const totals = getters.platformTotals
    const trueCartItems = totals.items.map(item => {
      const newItem = {...item}
      const vsfitem = cartItems.find(_item => _item.totals.item_id === item.item_id)
      if (vsfitem) {
        newItem.product = vsfitem
      }
      return newItem
    })
    return trueCartItems
  },
  getPurchaseCountry (state: CheckoutState) {
    const storeView: any = currentStoreView()
    let purchaseCountry = state.purchaseCountry || storeView.i18n.defaultCountry
    if (storeView.shipping_countries && !storeView.shipping_countries.includes(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
    // If purchaseCountry isn't valid ISO 3166 we overwrite it
    if (!/^[A-Za-z]{2,2}$/.test(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
  },
  isFreeShipping(state: CheckoutState, getters) {
    // Check if it freeshipping from coupon or not
    return getters.platformTotals.total_segments.find((totalsSegment) => {
      return totalsSegment.code === 'shipping' && parseInt(totalsSegment.value) === 0
    })
  },
  order (state: CheckoutState, getters, rootState, rootGetters): KlarnaOrder {
    const storeView: any = currentStoreView()
    const cartItems = getters.getTrueCartItems
    const shippingMethods = rootGetters['shipping/getShippingMethods']
    const totals = getters.platformTotals

    const checkoutOrder: KlarnaOrder = {
      purchase_country: getters.getPurchaseCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      shipping_countries: storeView.shipping_countries || [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: Math.round(totals.base_grand_total * 100),
      order_tax_amount: Math.round(totals.base_tax_amount * 100),
      options: config.klarna.options ? config.klarna.options : null,
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
