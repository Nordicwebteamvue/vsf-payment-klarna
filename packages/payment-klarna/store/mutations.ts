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
  retryCreateOrder (state) {
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
      loading: false,
      error: false,
      attempts: 0
    }
  },
  getConfirmation (state, payload) {
    state.confirmation.loading = true
  },
  confirmation (state, payload) {
    state.confirmation = {
      ...payload,
      loading: false
    }
  },
  getKcoPayPal (state, payload) {
    state.checkout.loading = true
  },
  setKcoPayPal (state, payload) {
    state.checkout.kcoPayPal = payload
  },
  merchantData (state, payload) {
    state.merchantData = payload
  },
  resetMerchantData (state) {
    state.merchantData = {}
  }
}
