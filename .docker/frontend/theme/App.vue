<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import buttonColor from 'src/modules/payment-klarna/plugins/buttonColor'
const DefaultLayout = () => import(/* webpackChunkName: "vsf-layout-default" */ './layouts/Default')
const EmptyLayout = () => import(/* webpackChunkName: "vsf-layout-empty" */ './layouts/Empty')
const MinimalLayout = () => import(/* webpackChunkName: "vsf-layout-minimal" */ './layouts/Minimal')

export default {
  data () {
    return {
      ordersData: []
    }
  },
  computed: {
    ...mapState({
      overlayActive: state => state.ui.overlay
    }),
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    }
  },
  components: {
    DefaultLayout,
    EmptyLayout,
    MinimalLayout
  },
  mounted () {
    // Add buttonColor plugin
    this.$store.dispatch('kco/addPlugin', buttonColor)
  }
}
</script>
