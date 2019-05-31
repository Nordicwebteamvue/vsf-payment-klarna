import { MutationTree } from 'vuex'
import * as types from './mutation-types'

export const mutations: MutationTree<any> = {
  createOrder (state) {
    state.checkout.loading = true
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
  }
}
