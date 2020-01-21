import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const plugin: KlarnaPlugin = {
  name: 'kss',
  beforeCreate: ({ config, getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    const mapRedirectUrl = (externalPaymentConfig) => {
      if (externalPaymentConfig.name == 'PayPal') {
        let uri = externalPaymentConfig.redirect_url
        const { storeCode } = currentStoreView()
        const { productBaseUrl } = config.klarna
        externalPaymentConfig.redirect_url = `${productBaseUrl}/${storeCode}/${uri}`
      }
      return externalPaymentConfig
    }
    order.external_payment_methods = config.klarna.external_payment_methods ? config.klarna.external_payment_methods.map(mapRedirectUrl) : null;
    order.external_checkouts = config.klarna.external_checkouts ? config.klarna.external_checkouts : null;
    return order
  }
}

export default plugin
