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

const storageTarget = '@vsf/klarna_order_id'

export default {
  name: 'KlarnaCheckout',
  data () {
    return {
      createdOrder: {
        id: ''
      }
    }
  },
  async mounted () {
    setTimeout(async () => {
      this.saveOrderIdToLocalStorage()
      await this.upsertOrder()
      this.saveOrderIdToLocalStorage()
    }, 100)
  },
  beforeMount () {
    this.$bus.$on('updateKlarnaOrder', this.configureUpdateOrder())
  },
  components: {
    LoadingSpinner
  },
  computed: {
    ...mapGetters({
      checkout: 'kco/checkout'
    })
  },
  methods: {
    async upsertOrder () {
      await this.$store.dispatch('kco/createOrder')
      setTimeout(() => {
        Array.from(this.checkout.scriptsTags).forEach(tag => {
          // TODO: Make this work with <script> tag insertion
          (() => {eval(tag.text)}).call(window) // eslint-disable-line
          this.$refs.scripts.appendChild(tag)
        })
        this.createdOrder.id = this.checkout.orderId || null
      }, 1)
    },
    async configureUpdateOrder () {
      if (!this.createdOrder.id) {
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
    saveOrderIdToLocalStorage () {
      this.createdOrder.id
        ? localStorage.setItem(storageTarget, this.createdOrder.id)
        : localStorage.removeItem(storageTarget)
    }
  }
}
</script>
