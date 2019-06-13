import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { calculateTotalTaxAmount, calculateTotalAmount } from '../helpers'

const mapProductToKlarna = (product) => {
  console.log('product', product)
  return {
    reference: product.sku,
    name: product.totals.name,
    quantity: product.totals.qty,
    unit_price: product.totals.price_incl_tax * 100,
    tax_rate: product.totals.tax_percent * 100,
    total_amount: product.totals.row_total_incl_tax * 100,
    total_discount_amount: (product.totals.discount_amount || 0) * 100,
    total_tax_amount: product.totals.tax_amount * 100
  }
}

export const getters: GetterTree<CheckoutState, RootState> = {
  checkout (state) {
    return state.checkout
  },
  confirmation (state) {
    return state.confirmation
  },
  order (state, getters, rootState, rootGetters) {
    const storeView = currentStoreView()
    const shippingMethods = rootState.shipping.methods
    const cartItems = rootGetters['cart/items']
    console.log('cartItems', cartItems)
    const {platformTotals: totals} = rootState.cart
    console.log('platformTotals', totals)
    console.log('rootGetters', rootGetters['cart/shippingInformation']['platformTotals'])
    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      merchant_urls: config.klarna.checkout.merchant,
      shipping_options: [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: totals.grand_total * 100,
      order_tax_amount: totals.tax_amount * 100
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (state.shippingOptions) {
      checkoutOrder.shipping_options = shippingMethods.map((method, index: number) => {
        console.log('shippingMethod', method)
        const taxAmount = method.price_incl_tax - method.amount
        return {
          id: method.code || method.carrier_code,
          name: `${method.method_title}`,
          price: method.price_incl_tax ? method.price_incl_tax * 100 : 0,
          tax_amount: taxAmount ? taxAmount * 100 : 0,
          tax_rate: method.amount && taxAmount ? taxAmount / method.amount * 10000 : 0,
          preselected: index === 0
        }
      })
    }
    return checkoutOrder
  }
}
