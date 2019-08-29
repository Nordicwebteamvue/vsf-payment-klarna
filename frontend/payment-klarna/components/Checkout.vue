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
import LoadingSpinner from './LoadingSpinner.vue'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export default {
  name: 'KlarnaCheckout',
  async mounted () {
    if (this.hasTotals) {
      this.upsertOrder()
    } else {
      this.$bus.$on('cart-after-updatetotals', async () => {
        this.upsertOrder()
      })
    }
    // Todo: refactor
    this.$bus.$on('kcoOrderLoaded', () => {
      setTimeout(() => {
        this.onKcoAddressChange()
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
  components: {
    LoadingSpinner
  },
  computed: {
    ...mapGetters({
      checkout: 'kco/checkout',
      totals: 'kco/platformTotals',
      hasTotals: 'kco/hasTotals',
      coupon: 'cart/coupon'
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
          this.$store.dispatch('cart/getShippingMethods', {
            country_id: countryId
          })
          this.$bus.$emit('updateKlarnaOrder')
        }
      }
    }
  },
  methods: {
    async upsertOrder () {
      await this.$store.dispatch('kco/createOrder')
      setTimeout(() => {
        Array.from(this.checkout.scriptsTags).forEach(tag => {
          // TODO: Make this work with <script> tag insertion
          (() => {eval(tag.text)}).call(window) // eslint-disable-line
          this.$refs.scripts.appendChild(tag)
          this.$bus.$emit('kcoOrderLoaded')
        })
      }, 1)
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
    onKcoAddressChange () {
      return callApi(api => api.on({
        'change': (data) => {
          this.$bus.$emit('kcoAddressChange', data)
        }
      }))
    }
  }
}
</script>
