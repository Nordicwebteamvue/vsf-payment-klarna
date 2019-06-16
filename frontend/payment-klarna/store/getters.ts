import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

const mapProductToKlarna = (product) => {
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

const getTaxAmount = (totalAmount: number, taxRate: number) => {
  return totalAmount / (1 + (1 / taxRate))
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
    const {platformTotals: totals} = rootState.cart
    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: totals.subtotal_incl_tax * 100,
      order_tax_amount: (totals.subtotal_incl_tax - totals.subtotal) * 100
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (state.shippingOptions) {
      checkoutOrder.shipping_options = shippingMethods.map((method, index: number) => {
        const price = method.price_incl_tax || method.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(price, shippingTaxRate)
        return {
          id: method.code || `${method.carrier_code}_${method.method_code}`,
          name: `${method.carrier_title}`,
          price: price ? price * 100 : 0,
          tax_amount: taxAmount ? taxAmount * 100 : 0,
          tax_rate: shippingTaxRate * 10000,
          preselected: index === 0
        }
      })
    }
    return checkoutOrder
  }
}
