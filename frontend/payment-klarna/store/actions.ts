import CheckoutState from '../types/CheckoutState'
import { ActionTree, ActionContext, Store } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'
import qs from 'qs'
import { getScriptTagsFromSnippet } from '../helpers'

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
        body: JSON.stringify({order})
      },
      silent: true
    })
    commit('createdOrder', {
      orderId: result.orderId,
      snippet: result.snippet,
      scriptsTags: getScriptTagsFromSnippet(result.snippet)
    })
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
    commit('confirmation', {
      snippet: result.html_snippet,
      scriptsTags: getScriptTagsFromSnippet(result.html_snippet)
    })
  }
}
