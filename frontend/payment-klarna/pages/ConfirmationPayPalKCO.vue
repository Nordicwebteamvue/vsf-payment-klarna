<style lang="scss" scoped>
  .confirmation {
    min-height: 580px;
  }
</style>

<script>
import config from 'config'
import store from '@vue-storefront/core/store'
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
  },
  methods: {
    initPayPal () {
      paypal.configure({
        mode: config.paypal.env, // Sandbox or live
        client_id: config.paypal.client,
        client_secret: config.paypal.secret
      })

      let items = []

      const cartItems = store.state.cart.cartItems

      cartItems.map((product) => {
        items.push({
          name: product.name,
          sku: product.sku,
          description: product.description ? product.description : product.name,
          currency: this.currency,
          tax: 0,
          price: product.totals.price,
          quantity: product.totals.qty
        })
      })

      var payReq = JSON.stringify({
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: config.paypal.return_url,
          cancel_url: config.paypal.cancel_url
        },
        transactions: [{
          amount: {
            total: this.grandTotal(),
            currency: this.currency,
            details: {
              subtotal: this.subTotal(),
              tax: 0,
              shipping: this.shipping()
            }
          },
          item_list: {
            items: items
          },
          description: config.paypal.description
        }]
      })

      paypal.payment.create(payReq, (error, payment) => {
        var links = {}

        if (error) {
          console.error(JSON.stringify(error))
        } else {
          // Capture HATEOAS links
          payment.links.forEach((linkObj) => {
            links[linkObj.rel] = {
              href: linkObj.href,
              method: linkObj.method
            }
          })

          // If the redirect URL is present, redirect the customer to that URL
          if (links.hasOwnProperty('approval_url')) {
            this.$Progress.finish()
            // Redirect the customer to links['approval_url'].href
            window.location = links['approval_url'].href
          } else {
            this.$Progress.fail()
            console.error('no redirect URI present')
          }
        }
      })
    }
  }
}
</script>
