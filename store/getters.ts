import { GetterTree } from 'vuex'
import CheckoutState from '../types/CheckoutState'
import RootState from '@vue-storefront/core/types/RootState'
import config from 'config'

const getters: GetterTree<CheckoutState, RootState> = {
  create () {
    // POST /checkout/v3/orders
    const siteEnvironment = config.klarna.test ? 'test' : 'live'
    const url = 'https://api.playground.klarna.com/checkout/v3/orders' // config.klarna.endpoint[config.klarna.endpointLocation][siteEnvironment]

    return url
  },
  update () {
    // POST /checkout/v3/orders/{order_id}
    const siteEnvironment = config.klarna.test ? 'test' : 'live'
    const url = 'https://api.playground.klarna.com/checkout/v3/orders/' // config.klarna.endpoint[config.klarna.endpointLocation][siteEnvironment]

    return url
  },
  retrieve () {
    // GET /checkout/v3/orders/{order_id}
    const siteEnvironment = config.klarna.test ? 'test' : 'live'
    const url = 'https://api.playground.klarna.com/checkout/v3/orders/' // config.klarna.endpoint[config.klarna.endpointLocation][siteEnvironment]

    return url
  }
}

export default getters
