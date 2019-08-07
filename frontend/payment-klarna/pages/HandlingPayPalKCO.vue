<template>
  <div class="paypay-wrapup">
    <span>{{ $t("You will be redirected to PayPal's web portal to complete and pay your order securely. Please wait while your payment is being processed....") }}</span>
  </div>
</template>

<style scoped>
  .paypay-wrapup
  {
    margin: 20px 0;
    text-align: center;
    min-height: 400px;
    display: flex;
    align-items: center;
  }
</style>
<script>
import config from 'config'
import paypal from 'paypal-rest-sdk-kodbruket-fixed'
import PaypalKCO from './HandlingPayPalKCO.ts'

export default {
  mixins: [PaypalKCO],
  beforeMount () {
    try {
      this.$store.dispatch('kco/retrievePayPalKco')
    } catch (e) {
      console.error(e)
      window.location = config.paypal.cancel_url
    }
  },
  mounted () {
    // Build PayPal payment request
    this.$Progress.start()
    this.$bus.$on('cart-after-updatetotals', this.afterTotals)
  },
  methods: {
    afterTotals () {
      try {
        this.prepareOrder()
        this.pushOrder()
        this.initPayPal()
      } catch (e) {
        this.$Progress.fail()
        console.log(e)
        window.location = this.PayPalCancelUrl
      }
    },
    prepareOrder () {
      this.order = {
        user_id: this.$store.state.user.current ? this.$store.state.user.current.id.toString() : (this.userId ? this.userId : ''),
        cart_id: this.$store.state.cart.cartServerToken ? this.$store.state.cart.cartServerToken : '',
        products: this.$store.state.cart.cartItems,
        addressInformation: {
          billingAddress: {
            region: null,
            region_id: null,
            country_id: this.billingAddress.country.toUpperCase(),
            street: [this.billingAddress.street_address],
            company: 'NA',
            telephone: this.billingAddress.phone,
            postcode: this.billingAddress.postal_code,
            city: this.billingAddress.city,
            firstname: this.billingAddress.given_name,
            lastname: this.billingAddress.family_name,
            email: this.billingAddress.email,
            region_code: null,
            vat_id: null
          },
          shipping_method_code: 'brev',
          shipping_carrier_code: 'brev',
          payment_method_code: 'vsfpaypal',
          payment_method_additional: {
            paymentMethod: 'kcopaypalvsf'
          },
          shippingExtraFields: ''
        }
      }
      if (!this.isVirtualCart) {
        this.order.addressInformation.shippingAddress = {
          region: null,
          region_id: null,
          country_id: this.shippingAddress.country.toUpperCase(),
          street: [this.shippingAddress.street_address],
          company: 'NA', // TODO: Fix me! https://github.com/DivanteLtd/vue-storefront/issues/224
          telephone: this.shippingAddress.phone,
          postcode: this.shippingAddress.postal_code,
          city: this.shippingAddress.city,
          firstname: this.shippingAddress.given_name,
          lastname: this.shippingAddress.family_name,
          email: this.shippingAddress.email,
          region_code: null
        }
      }
      return this.order
    },
    pushOrder () {
      this.$store.dispatch('checkout/placeOrder', { order: this.prepareOrder() })
    },
    initPayPal () {
      paypal.configure({
        mode: config.paypal.env, // Sandbox or live
        client_id: config.paypal.client,
        client_secret: config.paypal.secret
      })
      const items = this.items.map((product) => ({
        name: product.name,
        sku: product.reference,
        description: product.description ? product.description : product.name,
        currency: this.currency,
        tax: 0,
        price: product.unit_price / 100,
        quantity: product.quantity
      }))

      const shippingAddress = {
        recipient_name: this.shippingAddress.given_name,
        line1: this.shippingAddress.street_address,
        line2: null,
        city: this.shippingAddress.city,
        country_code: this.shippingAddress.country.toUpperCase(),
        postal_code: this.shippingAddress.postal_code,
        phone: this.shippingAddress.phone,
        state: null
      }
      const payReq = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: this.PayPalReturnUrl,
          cancel_url: this.PayPalCancelUrl
        },
        transactions: [{
          amount: {
            total: this.grandTotal,
            currency: this.currency,
            details: {
              subtotal: this.subTotal,
              tax: this.tax,
              shipping: this.shipping
            }
          },
          item_list: {
            items: items,
            shipping_address: shippingAddress
          },
          description: config.paypal.description
        }]
      }
      paypal.payment.create(JSON.stringify(payReq), (error, payment) => {
        const links = {}

        if (error) {
          console.error('PayPal error', payReq, JSON.stringify(error, null, 4))
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
            window.location = this.PayPalCancelUrl
          }
        }
      })
    }
  }
}
</script>
