import { KlarnaState, KlarnaOrder, KlarnaPlugin } from '../types'
import { ActionTree } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'
import Vue from 'vue'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import { plugins, addPlugin } from '../plugins'

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

export const actions: ActionTree<KlarnaState, RootState> = {
  addPlugin (context, plugin: KlarnaPlugin) {
    addPlugin(plugin)
  },
  setPurchaseCountry ({ commit }, country: string) {
    commit('setPurchaseCountry', country)
  },
  removeLocalStorage ({ getters }) {
    localStorage.removeItem(getters.storageTarget)
  },
  async klarnaCreateOrder ({ commit, dispatch }, { url, body }) {
    const { result }: any = await execute(url, 'POST', body)
    if (result.error) {
      Vue.prototype.$bus.$emit('klarna-create-error', result)
      if (result.error && result.error.error_code === 'READ_ONLY_ORDER') {
        dispatch('removeLocalStorage')
        await dispatch('createOrder')
        return false
      }
      commit('createOrderError', result.error)
      throw new Error('Klarna error')
    }
    return result
  },
  async orderErrorCatch ({ getters, dispatch, state }, error) {
    const { order } = getters
    if (order && order.reason) {
      console.log('Error:', order.reason)
    }
    if (error) {
      console.log('Error:', error)
    }
    if (state.checkout.attempts > 3) {
      window.location.reload()
      return
    }
    await dispatch('createOrder')
  },
  async createOrder ({ commit, dispatch, getters, state }) {
    commit('createOrder')
    try {
      await dispatch('cart/syncTotals', { forceServerSync: true }, { root: true })
      // Plugins: beforeCreate
      const order: KlarnaOrder = plugins
        .filter(plugin => plugin.beforeCreate)
        .reduce((order, { beforeCreate }) => beforeCreate({ order, getters, state, config }), getters.order)
      const storeCode = currentStoreView().storeCode
      const dataSourceStoreCode = storeCode && config.storeViews[storeCode] && config.storeViews[storeCode].dataSourceStoreCode
      const { snippet, ...result }: any = await dispatch('klarnaCreateOrder', {
        url: config.klarna.create || config.klarna.endpoint,
        body: {
          order,
          storeCode,
          dataSourceStoreCode
        }
      })
      // Plugins: afterCreate
      plugins
        .filter(plugin => plugin.afterCreate)
        .forEach(({ afterCreate }) => afterCreate({ result, order }))
      Vue.prototype.$bus.$emit('klarna-created-order', { result, order })
      commit('createdOrder', {
        snippet: snippet,
        order: result
      })
      return result
    } catch (error) {
      dispatch('orderErrorCatch', error)
    }
  },
  async fetchOrder (context, sid: string) {
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result }: any = await execute(url)
    return result
  },
  async confirmation ({ commit, dispatch, getters }, { sid }) {
    commit('confirmationLoading')
    const { html_snippet, ...result } = await dispatch('fetchOrder', sid)
    // Plugins: onConfirmation
    plugins
      .filter(plugin => plugin.onConfirmation)
      .forEach(({ onConfirmation }) => onConfirmation({ result, dispatch, getters }))
    commit('confirmationDone', {
      ...result,
      snippet: html_snippet
    })
    return result
  },
  setMerchantData ({ commit }, merchantData) {
    commit('setMerchantData', merchantData)
  },
  resetMerchantData ({ commit }) {
    commit('resetMerchantData')
  }
}
