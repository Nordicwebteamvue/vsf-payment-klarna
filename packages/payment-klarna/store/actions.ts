import CheckoutState, { KlarnaPlugin } from '../types/CheckoutState'
import { ActionTree } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'
import Vue from 'vue'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

const execute = (url, method = 'GET', body = null) => TaskQueue.execute({
  url,
  payload: {
    method,
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: body ? JSON.stringify(body) : null
  },
  silent: true
})

export const actions: ActionTree<CheckoutState, RootState> = {
  addPlugin ({ commit }, plugin: KlarnaPlugin) {
    console.log('Added plugin', plugin.name)
    commit('addPlugin', plugin)
  },
  setPurchaseCountry ({ commit }, country: String) {
    commit('setPurchaseCountry', country)
  },
  saveOrderIdToLocalStorage({ getters }, orderId) {
    const klarnaOrderIdExpires = new Date();
    klarnaOrderIdExpires.setDate(klarnaOrderIdExpires.getDate() + 2);
    localStorage.setItem(getters.storageTarget, JSON.stringify({
      orderId,
      expires: klarnaOrderIdExpires.getTime()
    }))
  },
  getSavedOrderId({ getters }) {
    const maybeJson = localStorage.getItem(getters.storageTarget)
    let savedOrderId = ''
    if (maybeJson) {
      const json = JSON.parse(maybeJson)
      if (json.expires > Date.now()) {
        savedOrderId = json.orderId
      } else {
        localStorage.removeItem(getters.storageTarget)
      }
    }
    return savedOrderId
  },
  removeLocalStorage({ getters }) {
    localStorage.removeItem(getters.storageTarget)
  },
  async klarnaCreateOrder({ commit, dispatch }, {url, body}) {
    const { result } : any = await execute(url, 'POST', body)
    if (result.error) {
      Vue.prototype.$bus.$emit('klarna-create-error', result)
      if (result.body && result.body.error_code === 'READ_ONLY_ORDER') {
        dispatch('removeLocalStorage')
        await dispatch('createOrder')
        return false
      }
      commit('createOrderError', result.error)
      throw new Error('Klarna error')
    }
    return result
  },
  async orderError({ getters, commit, dispatch, state }) {
    const { order } = getters
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
  },
  async createOrder (context) {
    const { commit, dispatch, getters, state } = context
    commit('createOrder')
    try {
      await dispatch('cart/syncTotals', { forceServerSync: true }, { root: true })
      const order = state.plugins.reduce(({fn}, _order) => fn({...context, config}), getters.order)
      const savedOrderId = await dispatch('getSavedOrderId')
      const storeCode = currentStoreView().storeCode
      const dataSourceStoreCode = storeCode && config.storeViews[storeCode] && config.storeViews[storeCode].dataSourceStoreCode
      const result: any = await dispatch('klarnaCreateOrder', {
        url: config.klarna.endpoint,
        body: {
          orderId: savedOrderId,
          order,
          storeCode,
          dataSourceStoreCode,
        }
      })
      Vue.prototype.$bus.$emit('klarna-created-order', {result, order})
      const {snippet, ...klarnaResult} = result
      dispatch('saveOrderIdToLocalStorage', result.order_id)
      localStorage.setItem('kco/last-order', JSON.stringify(order))
      commit('createdOrder', {
        snippet: snippet,
        orderId: result.order_id,
        order: result
      })
      return klarnaResult
    } catch (error) {
      dispatch('orderError')
    }
  },
  async fetchOrder ({}, sid) {
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result } : any = await execute(url)
    return result
  },
  async confirmation ({ commit, dispatch, getters }, { sid }) {
    commit('getConfirmation')
    const result = await dispatch('fetchOrder', sid)
    localStorage.removeItem(getters.storageTarget)
    const { html_snippet: snippet, ...klarnaResult } = result
    commit('confirmation', {
      snippet
    })
    return klarnaResult
  },
  async retrievePayPalKco ({ commit },) {
    commit('getKcoPayPal')
    let klarnaSidArray = JSON.parse(localStorage.getItem('_klarna_sdid_ch'))
    // last sid of order
    let sid = klarnaSidArray[klarnaSidArray.length - 1 ][0];
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result } : any = await execute(url)
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
