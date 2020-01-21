import { MutationTree } from 'vuex'

export const mutations: MutationTree<any> = {
  setPurchaseCountry (state, country) {
    state.purchaseCountry = country
  },
  createOrder (state) {
    state.checkout.attempts += 1
    state.checkout.loading = true
    state.checkout.error = false
  },
  createOrderError (state) {
    state.checkout.loading = false
    state.checkout.error = true
    state.checkout.snippet = null
  },
  createdOrder (state, payload) {
    state.checkout = {
      ...payload,
      orderId: payload.order.orderId,
      loading: false,
      error: false,
      attempts: 0
    }
  },
  confirmationLoading (state) {
    state.confirmation.loading = true
  },
  confirmationDone (state, payload) {
    state.confirmation = {
      ...payload,
      loading: false
    }
  },
  getKcoPayPal (state) {
    state.checkout.loading = true
  },
  setKcoPayPal (state, payload) {
    state.checkout.kcoPayPal = payload
  },
  setMerchantData (state, payload) {
    state.merchantData = payload
  },
  resetMerchantData (state) {
    state.merchantData = {}
  }
}
