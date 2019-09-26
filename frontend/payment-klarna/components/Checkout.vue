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
    // Todo: refactor
    this.$bus.$on('kcoOrderLoaded', () => {
      setTimeout(async () => {
        const order = await this.$store.dispatch('kco/fetchOrder', this.checkout.orderId)
        this.onKcoAddressChange({
          totalSegments: this.totals.total_segments,
          shippingAddress: order.shipping_address
        })
      }, 2000)
    })
  },
  beforeMount () {
    this.$bus.$on('updateKlarnaOrder', this.configureUpdateOrder)
  },
  beforeDestroy () {
    this.$bus.$off('updateKlarnaOrder')
    this.$bus.$off('cart-after-updatetotals')
    this.$bus.$off('kco-reload-component')
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
        this.$bus.$emit('updateKlarnaOrder')
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
          this.$bus.$emit('updateKlarnaOrder')
        }
      }
    }
  },
  methods: {
    async upsertOrder () {
      if (!this.hasTotals) {
        return
      }
      await this.$store.dispatch('kco/createOrder')
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          Array.from(this.checkout.scriptsTags).forEach(tag => {
            // TODO: Make this work with <script> tag insertion
            (() => {eval(tag.text)}).call(window) // eslint-disable-line
            this.$refs.scripts.appendChild(tag)
            this.$bus.$emit('kcoOrderLoaded')
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
    onKcoAddressChange (orderData) {
      if (orderData.shippingAddress.postal_code) {
        this.$bus.$emit('kcoAddressChange', orderData)
      }
      return callApi(api => api.on({
        'billing_address_change': async (data) => {
          this.$bus.$emit('kcoOrderLoaded')
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
