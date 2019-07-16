import CheckoutState from '../types/CheckoutState'
import { ActionTree, ActionContext, Store } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'
import { getScriptTagsFromSnippet } from '../helpers'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export const actions: ActionTree<CheckoutState, RootState> = {
  async createOrder ({ commit, state, getters }) {
    commit('createOrder')
    const { order } = getters
    const url = config.klarna.endpoint
    const { result }: any = await TaskQueue.execute({
      url,
      payload: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ order, storeCode: currentStoreView().storeCode })
      },
      silent: true
    })
    if (result.error) {
      console.log('error', result)
      commit('createOrderError', result.error)
      return
    }
    const {snippet, ...klarnaResult} = result
    commit('createdOrder', {
      orderId: klarnaResult.orderId,
      snippet: snippet,
      scriptsTags: getScriptTagsFromSnippet(result.snippet)
    })
    return klarnaResult
  },
  async confirmation ({ commit, state, dispatch }, { sid }) {
    commit('getConfirmation')
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result }: any = await TaskQueue.execute({
      url,
      payload: {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      },
      silent: true
    })
    dispatch('cart/clear', null, {root:true})
    const {html_snippet: snippet, ...klarnaResult} = result
    commit('confirmation', {
      snippet,
      scriptsTags: getScriptTagsFromSnippet(snippet)
    })
    return klarnaResult
  },
  async retrievePayPalKco ({ commit, state, dispatch },) {
    commit('getKcoPayPal')
    let klarnaSidArray = JSON.parse(localStorage.getItem('_klarna_sdid_ch'))
    // last sid of order
    let sid = klarnaSidArray[klarnaSidArray.length - 1 ][0];
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result }: any = await TaskQueue.execute({
      url,
      payload: {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      },
      silent: true
    })
    commit('setKcoPayPal', {
      result
    })
    return result;
  },
  setMerchantData ({ commit }, merchantData) {
    commit('merchantData', merchantData)
  },
  resetMerchantData ({ commit }) {
    commit('resetMerchantData')
  }
}
