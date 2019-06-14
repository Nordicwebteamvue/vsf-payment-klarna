<template>
  <div class="confirmation">
    <div ref="scripts" />
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
import LoadingSpinner from './LoadingSpinner.vue'

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
      const {sid} = qs.parse(queryString, { ignoreQueryPrefix: true })
      if (!sid) {
        return
      }
      const result = await this.$store.dispatch('kco/confirmation', { sid })
      this.$bus.$emit('checkout-do-placeOrder', result)
      setTimeout(() => {
        Array.from(this.confirmation.scriptsTags).forEach(tag => {
          // TODO: Make this work with <script> tag insertion
          (() => {eval(tag.text)}).call(window) // eslint-disable-line
          this.$refs.scripts.appendChild(tag)
        })
      }, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
  .confirmation {
    min-height: 580px;
  }
</style>
