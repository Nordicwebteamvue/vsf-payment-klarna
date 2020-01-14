import { TaskQueue } from '@vue-storefront/core/lib/sync'
import {defaultPlugins, addPlugin} from '../plugins'

const execute = (url, body) => TaskQueue.execute({ url,
  payload: {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  },
  silent: true
})

export function afterRegistration({ Vue, isServer, config, store }) {
  if (!isServer) {
    defaultPlugins.forEach((plugin) => {
      addPlugin(plugin)
    })
    if (config.klarna.validate_order) {
      const url = config.klarna.validate_order
      Vue.prototype.$bus.$on('klarna-event-order_total_change', () => {
        const {orderId} = store.state.kco.checkout
        if (url && orderId) {
          execute(url, { orderId })
        }
      })
    }
  }
}
