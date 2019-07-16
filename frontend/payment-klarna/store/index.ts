import { Module } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

export const module: Module<CheckoutState, any> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state: {
    shippingOptions: true,
    merchantData: {},
    checkout: {
      orderId: '',
      loading: false,
      snippet: null,
      scriptsTags: null,
      error: false
    },
    confirmation: {
      loading: false,
      snippet: null,
      scriptsTags: null,
      error: false
    }
  }
}
