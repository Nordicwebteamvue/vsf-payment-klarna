<template>
  <div id="confirmation">
    <div id="ref-scripts" ref="scripts" />
    <div id="this-loading" v-if="loading">
      Loading
    </div>
    <div id="this-snippet" v-if="html" v-html="html" /> <!-- eslint-disable-line vue/no-v-html -->
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

export default {
  name: 'KlarnaConfirmation',
  data: function () {
    return {
      loading: false,
      html: ''
    }
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
      console.log('snippet', json.result.html_snippet)
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
  .new-collection {
    @media (max-width: 767px) {
      padding-top: 0;
    }
  }
</style>
