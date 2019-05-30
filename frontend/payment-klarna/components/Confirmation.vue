<template>
  <div class="confirmation">
    <div ref="scripts" />
    <div v-if="loading">
      <loading-spinner />
    </div>
    <div v-if="html" v-html="html" /> <!-- eslint-disable-line vue/no-v-html -->
  </div>
</template>

<script>
import {
  getScriptTagsFromSnippet
} from './helpers'
import fetch from 'isomorphic-fetch'
import qs from 'qs'
import config from 'config'
import { isServer } from '@vue-storefront/core/helpers'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'KlarnaConfirmation',
  data: function () {
    return {
      loading: false,
      html: ''
    }
  },
  components: {
    LoadingSpinner
  },
  async mounted () {
    if (!isServer) {
      this.loading = true
      const queryString = this.$route.fullPath.replace(this.$route.path, '')
      const {sid} = qs.parse(queryString, { ignoreQueryPrefix: true })
      if (!sid) {
        return
      }
      const url = config.klarna.confirmation.replace('{{sid}}', sid)
      const result = await fetch(url)
      const json = await result.json()
      this.$store.dispatch('cart/clear')
      this.html = json.result.html_snippet
      const scriptsTags = getScriptTagsFromSnippet(this.html)
      setTimeout(() => {
        Array.from(scriptsTags).forEach(tag => {
          // TODO: Make this work with <script> tag insertion
          (() => {eval(tag.text)}).call(window) // eslint-disable-line
          this.$refs.scripts.appendChild(tag)
        })
        this.loading = false
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
