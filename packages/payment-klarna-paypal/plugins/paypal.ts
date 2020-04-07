import i18n from '@vue-storefront/i18n'
import { KlarnaPlugin } from 'src/modules/payment-klarna/types'

const plugin: KlarnaPlugin = {
  name: 'paypal',
  beforeCreate: ({ config, order }) => {
    if (!config.paypal.redirect_url) {
      throw new Error('Missing redirect_url in config.paypal')
    }
    order.externalPaymentMethods.push({
      name: 'PayPal',
      redirectUrl: config.paypal.redirect_url,
      imageUrl: 'https://www.paypalobjects.com/images/shared/paypal-logo-129x32.svg',
      description: i18n.tc('Pay with PayPal')
    })
    return order
  }
}

export default plugin
