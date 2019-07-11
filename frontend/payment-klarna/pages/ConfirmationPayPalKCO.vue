<template>
  <div/>
</template>
<style lang="scss" scoped>
  .confirmation {
    min-height: 580px;
  }
</style>

<script>
import config from 'config'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import paypal from 'paypal-rest-sdk-kodbruket-fixed'

export default {
  name: 'PaypalConfirmationKCO',
  data () {
    const storeView = currentStoreView()
    return {
      loader: false,
      commit: true,
      currency: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale.replace('-', '_') // Convert to PayPal format of locale
    }
  },
  mounted () {
    // Build PayPal payment reques
    this.$Progress.start()
    this.checkConfirmPayPal()
  },
  methods: {
    checkConfirmPayPal () {
      paypal.configure({
        mode: config.paypal.env, // Sandbox or live
        client_id: config.paypal.client,
        client_secret: config.paypal.secret
      })
      var paymentId = this.$route.query.paymentId
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) {
          console.log(error)
          throw error
        } else {
          console.log('Get Payment Response')
          console.log(payment)
          this.$bus.$emit('checkout-do-placeOrder', payment)
        }
      })
    }
  }
}
</script>
