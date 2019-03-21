<template>
  <div class="klarna-checkout" id="klarna-checkout">
    <div id="ref-scripts" ref="scripts" />
    <div id="this-loading" v-if="loading">Loading</div>
    <div id="this-snippet" v-if="snippet" v-html="snippet" />
  </div>
</template>

<script>
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import config from 'config'
import store from '@vue-storefront/store'

export default {
  name: 'KlarnaCheckout',
  data () {
    const storeView = currentStoreView()
    return {
      order: {
        order_lines: [],
        order_amount: 0,
        order_tax_amount: 0
      },
      klarnaApiUrl: '',
      snippet: null,
      createdOrder: {
        id: ''
      },
      loading: false,
      storeView
    }
  },
  async mounted () {
    // The call chain
    this.saveOrderIdToLocalStorage()
    this.order.order_amount = this.grandTotal
    this.order.order_tax_amount = this.taxAmount
    this.addCartItemsToOrder()
    this.configureLocaleAndMerchant()
    await this.upsertOrder()
    // await this.retrieveOrder()
    this.saveOrderIdToLocalStorage()
    // this.saveSnippet()
    // this.sendOrderToApi()
  },
  beforeMount () {
    // Uncomment this when communications with klarna api is ready
    this.$bus.$on('updateKlarnaOrder', this.configureUpdateOrder())
  },
  computed: {
    shippingMethodName () {
      let shippingName = store.getters['cart/totals']
      return shippingName.find(seg => seg.code === 'shipping').title
    },
    subTotalInclTax () {
      let cartSubTotalInclTax = store.getters['cart/totals']
      return cartSubTotalInclTax.find(seg => seg.code === 'subtotalInclTax').value * 100
    },
    grandTotal () {
      let cartTotals = store.getters['cart/totals']
      return cartTotals.find(seg => seg.code === 'grand_total').value * 100
    },
    taxAmount () {
      let tax = store.getters['cart/totals']
      return tax.find(seg => seg.code === 'tax').value * 100
    }
  },
  methods: {
    addCartItemsToOrder () {
      const productsInCart = store.getters['cart/items'].map(product => ({
        reference: product.sku,
        name: product.name,
        quantity: product.qty,
        unit_price: product.priceInclTax * 100,
        tax_rate: product.totals.tax_percent * 100,
        total_amount: this.calculateTotalAmount(product),
        total_discount_amount: product.totals.discount_amount * 100,
        total_tax_amount: this.calculateTotalAmount(product) - this.calculateTotalAmount(product) * 10000 / (10000 + product.totals.tax_percent * 100)
      }))

      // Do we use this information in api v3?
      // const shippingInformation = {
      //   type: 'shipping_fee',
      //   reference: 'SHIPPING REFERENCE HERE',
      //   name: this.shippingMethodName,
      //   quantity: 1,
      //   unit_price: this.getShippingInformation().platformTotals.base_shipping_incl_tax * 100,
      //   tax_rate: this.calculateShippingTaxRate()
      // }

      this.order.order_lines = [...productsInCart]// , shippingInformation]
    },
    configureLocaleAndMerchant () {
      const checkoutOrder = {
        purchase_country: this.storeView.i18n.defaultCountry, // this.payment.country,
        purchase_currency: this.storeView.i18n.currencyCode, // this.getCountryName(),
        locale: this.storeView.i18n.defaultLocale,
        merchant_urls: {
          id: config.klarna.checkout.merchant.id,
          terms: config.klarna.checkout.merchant.termsUri,
          checkout: config.klarna.checkout.merchant.checkoutUri,
          confirmation: config.klarna.checkout.merchant.confirmationUri,
          push: config.klarna.checkout.merchant.pushUri,
          validation: 'https://www.estore.com/api/validation', // set below in config
          shipping_option_update: 'https://www.estore.com/api/shipment',
          address_update: 'https://www.estore.com/api/address',
          notification: 'https://www.estore.com/api/pending',
          country_change: 'https://www.estore.com/api/country'
        }
      }
      this.order = { ...this.order, ...checkoutOrder }
    },
    async upsertOrder () {
      console.log('begin upsertOrder')
      let url = config.vsfapi.endpoints.create
      let apiUrl = config.klarna.endpoints.orders

      if (this.getOrderId()) {
        console.log('found order id in upsertorder! getOrderId() = ', this.getOrderId())
        let url = config.vsfapi.endpoints.update
        apiUrl += this.createdOrder.id
      }
      const body = {
        order: this.order,
        klarnaApiUrl: apiUrl,
        userAgent: navigator.userAgent
      }
      console.log('Sending to vsf api')
      this.loading = true
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const { result } = await res.json()
      const dummy = document.createElement('div')
      dummy.innerHTML = result.snippet
      const scriptsTags = dummy.querySelectorAll('script')
      this.snippet = result.snippet
      setTimeout(() => {
        Array.from(scriptsTags).forEach(tag => {
          (() => {eval(tag.text)}).call(window) // eslint-disable-line
          this.$refs.scripts.appendChild(tag)
        })
        this.createdOrder.id = result.orderId || null
        this.loading = false
      }, 1)
    },
    async retrieveOrder () {
      const apiUrl = config.klarna.endpoints.orders + this.createdOrder.id
      let url = config.vsfapi.endpoints.retrieve

      const body = {klarnaApiUrl: apiUrl}
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(res => res.json())
        .then(res => { this.snippet = res.result.snippet; return res })
        .catch(error => console.error('Error:', error))
    },
    async configureUpdateOrder () {
      console.log('trying to update order...')
      if (!this.createdOrder.id) {
        console.log('no order to update!')
        return
      }
      console.log('order id found!')
      await this.suspendCheckout()
      this.order.cart.items = {}
      this.addCartItemsToOrder()
      await this.upsertOrder()
      await this.resumeCheckout()
    },
    callApi (callback) {
      return new Promise((resolve, reject) => {
        window._klarnaCheckout((api) => {
          callback(api)
          resolve()
        })
      })
    },
    suspendCheckout () {
      return this.callApi(api => api.suspend())
    },
    resumeCheckout () {
      return this.callApi(api => api.resume())
    },
    saveOrderIdToLocalStorage () {
      // if (this.createdOrder.id) {
      //   localStorage.setItem('@vsf/klarna_order_id', this.createdOrder.id)
      // }
      this.createdOrder.id
        ? localStorage.setItem('@vsf/klarna_order_id', this.createdOrder.id)
        : localStorage.setItem('@vsf/klarna_order_id', '')
    },
    getOrderId () {
      return this.createdOrder.id || localStorage.getItem('@vsf/klarna_order_id') //
    },
    saveSnippet () {
      if (!this.snippet) {
        this.snippet = this.created.order.html_snippet
      }
    },
    getShippingInformation () {
      return store.getters['cart/shippingInformation']
    },
    calculateShippingTaxRate () {
      const {
        shipping_amount: shippingAmount,
        shipping_incl_tax: shippingAmountInclTax
      } = this.getShippingInformation().platformTotals

      const shippingTaxRateFormatted = (((shippingAmountInclTax - shippingAmount) / shippingAmount) * 100) * 100
      return shippingTaxRateFormatted
    },
    calculateTotalAmount (product) {
      return (product.qty * (product.priceInclTax * 100)) - (product.totals.discount_amount * 100)
    }
  }
}
</script>
