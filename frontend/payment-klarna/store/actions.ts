import CheckoutState from '../types/CheckoutState'
import { ActionTree, ActionContext, Store } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'
import Vue from 'vue'
import { getScriptTagsFromSnippet } from '../helpers'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export const actions: ActionTree<CheckoutState, RootState> = {
  async createOrder ({ commit, dispatch, getters, state }) {
    commit('createOrder')
    const { order } = getters
    if (!order || order.error) {
      if (order && order.reason) {
        console.log('Error:', order.reason)
      }
      if (state.checkout.attempts > 3) {
        window.location.reload()
        return
      }
      commit('retryCreateOrder')
      await dispatch('cart/syncTotals', { forceServerSync: true }, { root: true })
      await dispatch('createOrder')
      return
    }
    // TODO: Move this localStorage stuff into helpers
    const {storageTarget} = getters
    let savedOrderId = localStorage.getItem(storageTarget)
    if (savedOrderId) {
      const json = JSON.parse(savedOrderId)
      if (json.expires > Date.now()) {
        savedOrderId = json.orderId
      } else {
        localStorage.removeItem(storageTarget)
        savedOrderId = ''
      }
    }
    const url = config.klarna.endpoint
    const storeCode = currentStoreView().storeCode
    const dataSourceStoreCode = config.storeViews[storeCode].dataSourceStoreCode
    const { result }: any = await TaskQueue.execute({
      url,
      payload: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ orderId: savedOrderId, order, storeCode, dataSourceStoreCode })
      },
      silent: true
    })
    if (result.error) {
      Vue.prototype.$bus.$emit('klarna-create-error', result)
      if (result.error.body.error_code === 'READ_ONLY_ORDER') {
        localStorage.removeItem(storageTarget)
        await dispatch('createOrder')
        return
      }
      console.log('error', result)
      commit('createOrderError', result.error)
      return
    }
    const {snippet, ...klarnaResult} = result
    // TODO: Move this localStorage stuff into helpers
    const klarnaOrderIdExpires = new Date();
    klarnaOrderIdExpires.setDate(klarnaOrderIdExpires.getDate() + 2);
    localStorage.setItem(storageTarget, JSON.stringify({
      orderId: klarnaResult.orderId,
      expires: klarnaOrderIdExpires.getTime()
    }))
    commit('createdOrder', {
      snippet: snippet,
      orderId: klarnaResult.orderId,
      scriptsTags: getScriptTagsFromSnippet(result.snippet),
      order: result
    })
    return klarnaResult
  },
  async fetchOrder ({ commit, state, getters }, sid) {
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
    return result
  },
  async confirmation ({ commit, state, dispatch, getters }, { sid }) {
    commit('getConfirmation')
    const result = await dispatch('fetchOrder', sid)
    const {storageTarget} = getters
    localStorage.removeItem(storageTarget)
    dispatch('cart/clear', undefined, {root:true})
    const { html_snippet: snippet, ...klarnaResult } = result
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
