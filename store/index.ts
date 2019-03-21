import { Module } from 'vuex'
import getters from './getters'
import CheckoutState from '../types/CheckoutState'

export const module: Module<CheckoutState, any> = {
  namespaced: true,
  state: {
    apiUrl: ''
  },
  getters
}
