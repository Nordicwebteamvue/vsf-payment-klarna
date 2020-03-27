<template>
  <div class="confirmation">
    <div id="klarna-render-confirmation" />
    <div v-if="confirmation.loading">
      <loading-spinner />
    </div>
    <div v-if="confirmation.snippet" v-html="confirmation.snippet" /> <!-- eslint-disable-line vue/no-v-html -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import qs from 'qs'
import { isServer } from '@vue-storefront/core/helpers'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'KlarnaConfirmation',
  computed: {
    ...mapGetters({
      confirmation: 'kco/confirmation'
    })
  },
  components: {
    LoadingSpinner
  },
  async mounted () {
    if (!isServer) {
      const queryString = this.$route.fullPath.replace(this.$route.path, '')
      const { sid } = qs.parse(queryString, { ignoreQueryPrefix: true })
      if (!sid) {
        return
      }
      this.$bus.$emit('kco-order-confirmation', { orderId: sid })
      await this.$store.dispatch('kco/confirmation', { sid })
      this.$store.dispatch('cart/clear')
      const { default: postscribe } = await import('postscribe')
      postscribe('#klarna-render-confirmation', this.confirmation.snippet)
    }
  }
}
</script>

<style lang="scss" scoped>
.confirmation {
  min-height: 580px;
}
</style>

<style lang="scss">
#klarna-unsupported-page {
  display: none;
}
</style>
