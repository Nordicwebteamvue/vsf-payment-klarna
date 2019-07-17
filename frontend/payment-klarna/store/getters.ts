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

const mapRedirectUrl = (externalPaymentConfig) => {
  if (externalPaymentConfig.name == 'PayPal')
  {
    let uri = externalPaymentConfig.redirect_url
    externalPaymentConfig.redirect_url = config.baseUrl + currentStoreView().storeCode + '/' + uri;
  }
  return externalPaymentConfig
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
    if (!totals) {
      return {}
    }

    const external_payment_methods = config.klarna.external_payment_methods ? config.klarna.external_payment_methods.map(mapRedirectUrl) : null;
    const external_checkouts = config.klarna.external_checkouts ? config.klarna.external_checkouts : null;

    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: totals.base_grand_total * 100,
      order_tax_amount: totals.base_tax_amount * 100,
      external_payment_methods,
      external_checkouts,
      options: config.klarna.options ? config.klarna.options : null,
      merchant_data: JSON.stringify(state.merchantData)
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (config.klarna.showShippingOptions && state.shippingOptions) {
      checkoutOrder.order_amount = totals.subtotal_incl_tax * 100
      checkoutOrder.order_tax_amount = (totals.subtotal_incl_tax - totals.subtotal) * 100
      checkoutOrder.shipping_options = shippingMethods.map((method, index: number) => {
        const price = method.price_incl_tax || method.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(price, shippingTaxRate)
        return {
          id: method.code || `${method.carrier_code}_${method.method_code}`,
          name: `${method.carrier_title}`,
          price: price ? price * 100 : 0,
          tax_amount: taxAmount ? taxAmount * 100 : 0,
          tax_rate: shippingTaxRate ? shippingTaxRate * 10000: 0,
          preselected: index === 0
        }
      })
    }
    if (!config.klarna.showShippingOptions) {
      const { shippingMethod: code } = rootState.checkout.shippingDetails
      const shippingMethod = rootGetters['shipping/shippingMethods']
        .find(method => method.method_code === code)
      if (shippingMethod) {
        const price = shippingMethod.price_incl_tax || shippingMethod.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(shippingMethod.price_incl_tax, shippingTaxRate)
        checkoutOrder.order_lines.push({
          type: 'shipping_fee',
          reference: code,
          quantity: 1,
          name: `${shippingMethod.carrier_title} (${shippingMethod.method_title})`,
          total_amount: price ? price * 100 : 0,
          unit_price: price ? price * 100 : 0,
          total_tax_amount: taxAmount ? taxAmount * 100 : 0,
          tax_rate: shippingTaxRate ? shippingTaxRate * 10000: 0
        })
      }
    }
    return checkoutOrder
  }
}
