import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'

export const getters: GetterTree<CheckoutState, RootState> = {
  checkout (state) {
    return state.checkout
  },
  confirmation (state) {
    return state.confirmation
  }
}
