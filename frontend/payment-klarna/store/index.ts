import { Module } from 'vuex'
import CheckoutState from '../types/CheckoutState'

export const module: Module<CheckoutState, any> = {
  namespaced: true,
  state: {
    apiUrl: ''
  }
}
