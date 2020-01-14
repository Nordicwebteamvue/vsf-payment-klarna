import { Module } from 'vuex'
import KlarnaState from '../types/KlarnaState'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

export const module: Module<KlarnaState, any> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state: {
    shippingOptions: true,
    merchantData: {},
    purchaseCountry: '',
    checkout: {
      orderId: '',
      loading: false,
      snippet: null,
      error: false,
      attempts: 0
    },
    confirmation: {
      loading: false,
      snippet: null,
      error: false
    }
  }
}
