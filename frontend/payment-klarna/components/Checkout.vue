<template>
  <div class="klarna-checkout" id="klarna-checkout">
    <div ref="scripts" />
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

export default {
  name: 'KlarnaCheckout',
  components: {
    LoadingSpinner
  },
  async mounted () {
    await this.upsertOrder()
    callApi(api => api.on({
      'shipping_option_change': data => {
        this.$bus.$emit('klarna-shipping-option-change', data)
      }
    }))
    // Todo: refactor
    this.$bus.$on('klarna-order-loaded', () => {
      setTimeout(async () => {
        const order = await this.$store.dispatch('kco/fetchOrder', this.checkout.orderId)
        this.onKlarnaAddressChange({
          totalSegments: this.totals.total_segments,
          shippingAddress: order.shipping_address
        })
      }, 2000)
    })
  },
  beforeMount () {
    this.$bus.$on('klarna-update-order', this.configureUpdateOrder)
  },
  beforeDestroy () {
    this.$bus.$off('klarna-update-order')
    this.$bus.$off('cart-after-updatetotals')
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
    async upsertOrder () {
      await this.$store.dispatch('kco/createOrder')
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          Array.from(this.checkout.scriptsTags).forEach(tag => {
            // TODO: Make this work with <script> tag insertion
            (() => {eval(tag.text)}).call(window) // eslint-disable-line
            this.$refs.scripts.appendChild(tag)
            this.$bus.$emit('klarna-order-loaded')
          })
          resolve()
        }, 1)
      })
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
    onKlarnaAddressChange (orderData) {
      if (orderData.shippingAddress.postal_code) {
        this.$bus.$emit('klarna-address-change', orderData)
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
