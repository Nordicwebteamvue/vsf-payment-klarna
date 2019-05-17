import { Module } from 'vuex'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { CheckoutState } from '../types/CheckoutState'
import { actions } from './actions'

export const module: Module<CheckoutState, any> = {
  namespaced: true,
  state: {
    apiUrl: '',
    order: {
      order_lines: [],
      order_amount: 0,
      order_tax_amount: 0
    },
    snippet: null,
    createdOrder: {
      id: ''
    },
    loading: false,
    storeView: currentStoreView()
  },
  actions
}
