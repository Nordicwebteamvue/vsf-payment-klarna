import { KlarnaPaypalState } from '../types'
import { ActionTree } from 'vuex'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import config from 'config'
import RootState from '@vue-storefront/core/types/RootState'

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

export const actions: ActionTree<KlarnaPaypalState, RootState> = {
  async retrievePayPalKco ({ commit }) {
    commit('getKcoPayPal')
    const klarnaSidArray = JSON.parse(localStorage.getItem('_klarna_sdid_ch'))
    // last sid of order
    const sid = klarnaSidArray[klarnaSidArray.length - 1][0]
    const url = config.klarna.confirmation.replace('{{sid}}', sid)
    const { result }: any = await execute(url)
    commit('setKcoPayPal', {
      result
    })
    return result
  }
}
