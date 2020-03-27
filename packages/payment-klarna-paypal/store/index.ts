import { Module } from 'vuex'
import { KlarnaPaypalState } from '../types'
import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'

export const module: Module<KlarnaPaypalState, any> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state: {
    checkout: {
      kcoPayPal: {},
      loading: false
    }
  }
}
