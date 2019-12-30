<template>
  <div class="klarna-checkout" id="klarna-checkout">
    <div id="klarna-render-checkout" />
    <div v-if="checkout.loading">
      <loading-spinner />
    </div>
    <div v-if="checkout.error">
      Loading Klarna failed
    </div>
    <div v-if="checkout.snippet" v-html="checkout.snippet" /> <!-- eslint-disable-line vue/no-v-html -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { callApi } from '../helpers'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import LoadingSpinner from 'theme/components/theme/blocks/AsyncSidebar/LoadingSpinner.vue'
import postscribe from 'postscribe'
import { isServer } from '@vue-storefront/core/helpers'

const klarnaEvents = [
  'load', 'customer', 'change', 'billing_address_change', 'shipping_address_change', 'shipping_option_change', 'order_total_change', 'can_not_complete_order', 'network_error'
]

export default {
  name: 'KlarnaCheckout',
  components: {
    LoadingSpinner
  },
  async mounted () {
    if (isServer) {
      return
    }
    await this.upsertOrder()
  },
  beforeMount () {
    this.$bus.$on('klarna-update-order', this.configureUpdateOrder)
    this.$bus.$on('updateKlarnaOrder', this.configureUpdateOrder) // legacy
  },
  beforeDestroy () {
    this.$bus.$off('klarna-update-order')
    this.$bus.$off('updateKlarnaOrder') // legacy
  },
  computed: {
    ...mapGetters({
      order: 'kco/order',
      checkout: 'kco/checkout',
      totals: 'kco/platformTotals',
      hasTotals: 'kco/hasTotals',
      coupon: 'kco/coupon'
    })
  },
  watch: {
    coupon (newValue, oldValue) {
      if (!oldValue || newValue.code !== oldValue.code) {
        this.$bus.$emit('klarna-update-order')
      }
    },
    totals (newValue, oldValue) {
      if (oldValue) {
        if (newValue.qty !== oldValue.qty || newValue.base_grand_total !== oldValue.base_grand_total) {
          const storeView = currentStoreView()
          const countryId = this.$store.state.checkout.shippingDetails.country ? this.$store.state.checkout.shippingDetails.country : storeView.tax.defaultCountry
          this.$store.dispatch('cart/syncShippingMethods', {
            country_id: countryId
          })
          this.$bus.$emit('klarna-update-order')
        }
      }
    }
  },
  methods: {
    setupKlarnaListeners () {
      const events = {}
      klarnaEvents.forEach(event => {
        events[event] = data => {
          this.$bus.$emit('klarna-event-' + event, data)
        }
      })
      callApi(api => api.on(events))
      this.$bus.$on('klarna-event-shipping_option_change', (data) => {
        /* Watch shipping option event from Klarna */
        localStorage.setItem('shipping_method', JSON.stringify(data))
      })

      // Todo: refactor
      this.$bus.$on('klarna-order-loaded', () => {
        setTimeout(async () => {
          const order = await this.$store.dispatch('kco/fetchOrder', this.checkout.orderId)
          this.onKcoAddressChange({
            totalSegments: this.totals.total_segments,
            shippingAddress: order.shipping_address
          })
        }, 2000)
      })
    },
    async upsertOrder () {
      await this.$store.dispatch('kco/createOrder')
      postscribe('#klarna-render-checkout', this.checkout.snippet)
      this.setupKlarnaListeners()
    },
    async configureUpdateOrder () {
      if (!this.checkout.orderId) {
        return
      }
      await this.suspendCheckout()
      await this.upsertOrder()
      await this.resumeCheckout()
    },
    suspendCheckout () {
      return callApi(api => api.suspend())
    },
    resumeCheckout () {
      return callApi(api => api.resume())
    },
    onKcoAddressChange (orderData) {
      if (orderData.shippingAddress.postal_code) {
        this.$bus.$emit('kcoAddressChange', orderData)
      }
      return callApi(api => api.on({
        'billing_address_change': async (data) => {
          this.$bus.$emit('klarna-order-loaded')
        }
      }))
    }
  }
}
</script>

<style lang="css">
  div.wrapper.wrapper {
    height: 30vh;
    max-width: 100%;
    padding-left: 25px;
  }
</style>
