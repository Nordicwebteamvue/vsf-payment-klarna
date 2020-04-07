import { GetterTree } from 'vuex'
import { KlarnaState, KlarnaOrder, ShippingOption, KlarnaProduct } from '../types'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'
import { currentStoreView, localizedRoute } from '@vue-storefront/core/lib/multistore'
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import { router } from '@vue-storefront/core/app'
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem'

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
  const klarnaProduct: KlarnaProduct = {
    name: product.name,
    quantity: product.qty,
    unitPrice: Math.round(product.price_incl_tax * 100),
    taxRate: Math.round(product.tax_percent * 100),
    totalAmount: Math.round(product.row_total_incl_tax * 100) - Math.round(product.base_discount_amount * 100),
    totalDiscountAmount: Math.round((product.discount_amount || 0) * 100),
    totalTaxAmount: Math.round(product.tax_amount * 100)
  }
  if (vsfProduct) {
    klarnaProduct.imageUrl = getThumbnailPath(vsfProduct.image, 600, 600) || ''
    klarnaProduct.reference = vsfProduct.sku
    if (config.klarna.productBaseUrl) {
      klarnaProduct.productUrl = config.klarna.productBaseUrl + getProductUrl(vsfProduct)
    }
  }
  return klarnaProduct
}

const getTaxAmount = (totalAmount: number, taxRate: number) => {
  return totalAmount / (1 + (1 / taxRate))
}

export const getters: GetterTree<KlarnaState, RootState> = {
  checkout (state: KlarnaState) {
    return state.checkout
  },
  confirmation (state: KlarnaState) {
    return state.confirmation
  },
  coupon (state, getters, rootState, rootGetters) {
    // renamed to getCoupon in VSF 1.10
    return rootGetters['cart/getCoupon'] || rootGetters['cart/coupon']
  },
  hasTotals (state, getters, rootState) {
    const { platformTotals: totals } = rootState.cart
    const productTotals = rootState.cart.cartItems.every(item => !!item.totals)
    return !!totals && productTotals
  },
  platformTotals (state, getters, rootState) {
    const { platformTotals: totals } = rootState.cart
    return totals || {}
  },
  storageTarget () {
    const storeView = currentStoreView()
    const dbNamePrefix = storeView.storeCode ? storeView.storeCode + '-kco' : 'kco'
    return `${dbNamePrefix}/id`
  },
  getTrueCartItems (state: KlarnaState, getters, rootState, rootGetters) {
    const cartItems: Array<CartItem> = Array.from(rootGetters['cart/getCartItems'])
    const totals = getters.platformTotals
    const trueCartItems = totals.items.map(item => {
      const newItem = { ...item }
      const vsfitem = cartItems.find(_item => _item.totals && _item.totals.item_id === item.item_id)
      if (vsfitem) {
        newItem.product = vsfitem
      }
      return newItem
    })
    return trueCartItems
  },
  getPurchaseCountry (state: KlarnaState) {
    const storeView: any = currentStoreView()
    let purchaseCountry = state.purchaseCountry || storeView.i18n.defaultCountry
    if (storeView.shipping_countries && !storeView.shipping_countries.includes(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
    // If purchaseCountry isn't valid ISO 3166 we overwrite it
    if (!/^[A-Za-z]{2,2}$/.test(purchaseCountry)) {
      purchaseCountry = storeView.i18n.defaultCountry
    }
    return purchaseCountry
  },
  isFreeShipping (state: KlarnaState, getters) {
    // Check if it freeshipping from coupon or not
    return getters.platformTotals.total_segments.find((totalsSegment) => {
      return totalsSegment.code === 'shipping' && parseInt(totalsSegment.value) === 0
    })
  },
  order (state: KlarnaState, getters, rootState, rootGetters): KlarnaOrder {
    const storeView: any = currentStoreView()
    const cartItems = getters.getTrueCartItems
    const shippingMethods = rootGetters['checkout/getShippingMethods'] || rootGetters['shipping/shippingMethods']
    const totals = getters.platformTotals

    const checkoutOrder: KlarnaOrder = {
      purchaseCountry: getters.getPurchaseCountry,
      purchaseCurrency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale,
      shippingOptions: [],
      shippingCountries: storeView.shipping_countries || [],
      orderLines: cartItems.map(mapProductToKlarna),
      orderAmount: Math.round(totals.base_grand_total * 100),
      orderTaxAmount: Math.round(totals.base_tax_amount * 100),
      options: config.klarna.options ? config.klarna.options : null,
      merchantData: JSON.stringify(state.merchantData),
      externalPaymentMethods: [],
      externalCheckouts: []
    }
    if (config.klarna.showShippingOptions && state.shippingOptions) {
      checkoutOrder.orderAmount = Math.round((totals.base_grand_total - totals.base_shipping_incl_tax) * 100)
      checkoutOrder.orderTaxAmount = Math.round((totals.base_tax_amount - totals.base_shipping_tax_amount) * 100)
      checkoutOrder.shippingOptions = shippingMethods.map((method, index: number): ShippingOption => {
        const price = method.price_incl_tax || method.price || 0
        const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
        const taxAmount = getTaxAmount(price, shippingTaxRate)
        return {
          id: method.method_code,
          name: `${method.method_title}`,
          price: price ? Math.round(price * 100) : 0,
          taxAmount: taxAmount ? Math.round(taxAmount * 100) : 0,
          taxRate: shippingTaxRate ? Math.round(shippingTaxRate * 10000) : 0,
          preselected: index === 0
        }
      })
    }

    const { shippingMethod: code } = rootState.checkout.shippingDetails
    const shippingMethod = shippingMethods
      .find(method => method.method_code === code)
    if (shippingMethod) {
      const price = totals.shipping_incl_tax
      const shippingTaxRate = totals.shipping_tax_amount / totals.shipping_amount
      const taxAmount = getTaxAmount(totals.shipping_incl_tax, shippingTaxRate)
      checkoutOrder.orderAmount = Math.round((totals.base_grand_total) * 100)
      checkoutOrder.orderTaxAmount = Math.round((totals.base_tax_amount) * 100)
      checkoutOrder.orderLines.push({
        type: 'shipping_fee',
        quantity: 1,
        name: `${shippingMethod.carrier_title} (${shippingMethod.method_title})`,
        totalAmount: price ? price * 100 : 0,
        unitPrice: price ? price * 100 : 0,
        totalTaxAmount: taxAmount ? taxAmount * 100 : 0,
        taxRate: shippingTaxRate ? shippingTaxRate * 10000 : 0
      })
    }
    return checkoutOrder
  }
}
