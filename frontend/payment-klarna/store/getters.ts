import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import i18n from '@vue-storefront/i18n';

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
  const image_url = getThumbnailPath(product.image, 600, 600) || ''
  const klarnaProduct: any = {
    image_url,
    reference: product.sku,
    name: product.totals.name,
    quantity: product.totals.qty,
    unit_price: product.totals.price_incl_tax * 100 | 0, // Force int with '| 0'
    tax_rate: product.totals.tax_percent * 100 | 0,
    total_amount: (product.totals.row_total_incl_tax * 100 | 0) - (product.totals.base_discount_amount * 100 | 0),
    total_discount_amount: (product.totals.discount_amount || 0) * 100 | 0,
    total_tax_amount: product.totals.tax_amount * 100 | 0
  }
  if (config.klarna.showShippingOptions) {
    let weight = product[config.klarna.shipping_attributes.weight] | 0 //g
    klarnaProduct.shipping_attributes = {
        weight: weight,
        dimensions: {
            height: product[config.klarna.shipping_attributes.height] * 10 | 0,  //mm
            width: product[config.klarna.shipping_attributes.width] * 10 | 0, //mm
            length: product[config.klarna.shipping_attributes.length] * 10 | 0 //mmm
        }
    }
  }
  if (config.klarna.productBaseUrl) {
    klarnaProduct.product_url = config.klarna.productBaseUrl + getProductUrl(product)
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

    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      shipping_countries: storeView.shipping_countries || [],
      order_lines: cartItems.map(mapProductToKlarna),
      order_amount: totals.base_grand_total * 100 | 0,
      order_tax_amount: totals.base_tax_amount * 100 | 0,
      external_payment_methods,
      external_checkouts,
      options: klarnaOptions ? klarnaOptions : null,
      merchant_data: JSON.stringify(state.merchantData)
    }
    if (state.checkout.orderId) {
      checkoutOrder.orderId = state.checkout.orderId
    }
    if (config.klarna.showShippingOptions && state.shippingOptions) {
      checkoutOrder.order_amount = (totals.base_grand_total - totals.base_shipping_incl_tax) * 100 | 0
      checkoutOrder.order_tax_amount = (totals.base_tax_amount - totals.base_shipping_tax_amount) * 100 | 0
      checkoutOrder.shipping_options = shippingMethods.map((method, index: number) => {
        const price = method.price_incl_tax || method.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(price, shippingTaxRate)
        return {
          id: method.method_code,
          name: `${method.method_title}`,
          price: price ? price * 100 | 0 : 0,
          tax_amount: taxAmount ? taxAmount * 100 | 0 : 0,
          tax_rate: shippingTaxRate ? shippingTaxRate * 10000 | 0 : 0,
          preselected: index === 0
        }
      })
    }
    if (!config.klarna.showShippingOptions) {
      const { shippingMethod: code } = rootState.checkout.shippingDetails
      const shippingMethod = rootGetters['shipping/shippingMethods']
        .find(method => method.method_code === code)
      if (shippingMethod) {
        const price = totals.shipping_incl_tax
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(totals.shipping_incl_tax, shippingTaxRate)
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
