import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { mapProductToKlarna } from '../helpers'

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
    const cartTotals = rootGetters['cart/totals']
    const grandTotal = cartTotals.find(seg => seg.code === 'grand_total').value * 100
    const taxAmount = cartTotals.find(seg => seg.code === 'tax').value * 100
    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      merchant_urls: config.klarna.checkout.merchant,
      shipping_options: [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: grandTotal,
      order_tax_amount: taxAmount
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (state.shippingOptions) {
      checkoutOrder.shipping_options = shippingMethods.map((method, index) => {
        const taxAmount = method.price_incl_tax - method.amount
        return {
          id: method.code,
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
