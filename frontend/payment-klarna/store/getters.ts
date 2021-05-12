import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import i18n from '@vue-storefront/i18n'

const validateOrder = checkoutOrder => {
  let sum = checkoutOrder.order_lines.reduce((acc, line) => acc + line.total_amount, 0)
  return checkoutOrder.order_amount === sum
}

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
  if (config.klarna.addShippingAttributes) {
    let weight = product[config.klarna.shipping_attributes.weight] | 0 //g
    klarnaProduct.shipping_attributes = {
      weight: weight,
      dimensions: {
        height: product[config.klarna.shipping_attributes.height] * 10 | 0,  //mm
        width: product[config.klarna.shipping_attributes.width] * 10 | 0, //mm
        length: product[config.klarna.shipping_attributes.length] * 10 | 0 //mm
      }
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
    const cartItems = rootGetters['cart/getCartItems']
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

    const checkoutOrder: any = {
      purchase_country: storeView.i18n.defaultCountry,
      purchase_currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shipping_options: [],
      shipping_countries: storeView.shipping_countries || [],
      order_lines: trueCartItems.map(mapProductToKlarna),
      order_amount: Math.round(totals.base_grand_total * 100),
      order_tax_amount: Math.round(totals.base_tax_amount * 100),
      external_payment_methods,
      external_checkouts,
      options: klarnaOptions ? klarnaOptions : null,
      merchant_data: JSON.stringify({
        ...state.merchantData,
        couponCode: getters.coupon?.code || ''
      })
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
    if (!validateOrder(checkoutOrder)) {
      return {
        error: true,
        reason: 'Order amount incorrect'
      }
    }
    return checkoutOrder
  }
}
