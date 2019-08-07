import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import paypal from 'paypal-rest-sdk-kodbruket-fixed'
import { mapGetters } from 'vuex'

export default {
  name: 'PaypalKCO',
  data () {
    const storeView = currentStoreView()
    return {
      loader: false,
      commit: true,
      order: {},
      locale: storeView.i18n.defaultLocale.replace('-', '_') // Convert to PayPal format of locale
    }
  },
  computed: {
    ...mapGetters({
      checkout: 'kco/checkout',
      isVirtualCart: 'cart/isVirtualCart'
    }),
    PayPalReturnUrl () {
      return config.klarna.productBaseUrl + '/' + currentStoreView().storeCode + '/' + config.paypal.return_url
    },
    PayPalCancelUrl () {
      return config.paypal.cancel_url.replace('{{storeCode}}', currentStoreView().storeCode).replace(/([^:]\/)\/+/g, '$1') // eslint-disable-line camelcase
    },
    grandTotal () {
      return this.checkout.kcoPayPal.result.order_amount / 100
    },
    subTotal () {
      return this.checkout.kcoPayPal.result.order_amount / 100
    },
    shipping () {
      return 0
    },
    tax () {
      return 0
    },
    currency () {
      return this.checkout.kcoPayPal.result.purchase_currency
    },
    items () {
      return this.checkout.kcoPayPal.result.order_lines
    },
    billingAddress () {
      return this.checkout.kcoPayPal.result.billing_address
    },
    shippingAddress () {
      return this.checkout.kcoPayPal.result.shipping_address
    }
  }
}
