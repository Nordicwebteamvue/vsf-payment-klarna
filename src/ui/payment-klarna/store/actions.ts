import { CheckoutState } from '../types/CheckoutState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import { cacheStorage } from '../'

export const actions: ActionTree<CheckoutState, any> = {
  loadUsers ({ commit }) {
    return new Promise((resolve, reject) => {
      commit('test')
      resolve(true)
    })
  },
}
