<template>
  <div class="klarna-checkout" id="klarna-checkout">
    <div ref="scripts" />
    <div v-if="checkout.loading">
      <loading-spinner />
    </div>
    <div v-if="checkout.snippet" v-html="checkout.snippet" /> <!-- eslint-disable-line vue/no-v-html -->
  </div>
</template>

<script>
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import config from 'config'
import { mapGetters, mapState } from 'vuex'
import {
  callApi,
  mapProductToKlarna
} from '../helpers'
import LoadingSpinner from './LoadingSpinner.vue'

const storageTarget = '@vsf/klarna_order_id'

export default {
  name: 'KlarnaCheckout',
  data () {
    return {
      order: {
        order_lines: [],
        order_amount: 0,
        order_tax_amount: 0
      },
      createdOrder: {
        id: ''
      },
      storeView: currentStoreView()
    }
  },
  async mounted () {
    this.saveOrderIdToLocalStorage()
    this.order.order_amount = this.grandTotal
    this.order.order_tax_amount = this.taxAmount
    this.addCartItemsToOrder()
    this.configureLocaleAndMerchant()
    await this.upsertOrder()
    this.saveOrderIdToLocalStorage()
  },
  beforeMount () {
    this.$bus.$on('updateKlarnaOrder', this.configureUpdateOrder())
  },
  props: {
    orderExtra: {
      type: Object,
      default: function () {
        return {}
      }
    },
    shippingOptions: {
      type: Boolean,
      default: true
    }
  },
  components: {
    LoadingSpinner
  },
  computed: {
    ...mapGetters({
      checkout: 'kco/checkout',
      cartItems: 'cart/items',
      cartTotals: 'cart/totals',
      shippingInformation: 'cart/shippingInformation',
      shippingMethods: 'shipping/shippingMethods'
    }),
    ...mapState({
      cartServerToken: state => state.cart.cartServerToken
    }),
    subTotalInclTax () {
      return this.cartTotals.find(seg => seg.code === 'subtotalInclTax').value * 100
    },
    grandTotal () {
      return this.cartTotals.find(seg => seg.code === 'grand_total').value * 100
    },
    taxAmount () {
      return this.cartTotals.find(seg => seg.code === 'tax').value * 100
    }
  },
  methods: {
    addCartItemsToOrder () {
      const orderLines = this.cartItems.map(mapProductToKlarna)
      this.order.order_lines = [ ...orderLines ]
    },
    configureLocaleAndMerchant () {
      const checkoutOrder = {
        purchase_country: this.storeView.i18n.defaultCountry,
        purchase_currency: this.storeView.i18n.currencyCode,
        locale: this.storeView.i18n.defaultLocale,
        merchant_urls: config.klarna.checkout.merchant,
        shipping_options: []
      }
      if (this.shippingOptions) {
        checkoutOrder.shipping_options = this.shippingMethods.map((method, index) => {
          const taxAmount = method.price_incl_tax - method.amount
          return {
            'id': method.carrier_code,
            'name': `${method.method_title}`,
            'price': method.price_incl_tax ? method.price_incl_tax * 100 : 0,
            'tax_amount': taxAmount ? taxAmount * 100 : 0,
            'tax_rate': method.amount && taxAmount ? taxAmount / method.amount * 10000 : 0,
            'preselected': index === 0
          }
        })
      }
      this.order = { ...this.order, ...checkoutOrder, ...this.orderExtra }
    },
    async upsertOrder () {
      const body = {
        order: this.order,
        userAgent: navigator.userAgent
      }
      if (this.getOrderId()) {
        body.orderId = this.getOrderId()
      }
      await this.$store.dispatch('kco/createOrder', { body })
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
      this.order.cart.items = {}
      this.addCartItemsToOrder()
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
    },
    getOrderId () {
      return this.createdOrder.id || localStorage.getItem(storageTarget)
    }
  }
}
</script>
