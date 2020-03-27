import { MutationTree } from 'vuex'

export const mutations: MutationTree<any> = {
  getKcoPayPal (state) {
    state.checkout.loading = true
  },
  setKcoPayPal (state, payload) {
    state.checkout.kcoPayPal = payload
  }
}
