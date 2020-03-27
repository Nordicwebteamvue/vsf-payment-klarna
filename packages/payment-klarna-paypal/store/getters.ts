import { GetterTree } from 'vuex'
import { KlarnaPaypalState } from '../types'
import RootState from '@vue-storefront/core/types/RootState'

export const getters: GetterTree<KlarnaPaypalState, RootState> = {
  checkout (state: KlarnaPaypalState) {
    return state.checkout
  }
}
