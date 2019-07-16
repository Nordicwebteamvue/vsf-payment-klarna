import { MutationTree } from 'vuex'
import * as types from './mutation-types'

export const mutations: MutationTree<any> = {
  createOrder (state) {
    state.checkout.loading = true
    state.checkout.error = false
  },
  createOrderError (state) {
    state.checkout.loading = false
    state.checkout.error = true
  },
  createdOrder (state, payload) {
    state.checkout = {
      ...payload,
      loading: false
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
  }
}
