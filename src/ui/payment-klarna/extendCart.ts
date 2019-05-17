import { extendModule } from '@vue-storefront/core/lib/module'

const extendCartVuex = {
  getters: {
    shippingInformation (state) {
      let shipping
      if (state.platformTotalSegments) {
        return state
      } else {
        shipping = state.shipping instanceof Array ? state.shipping[0] : state.shipping
      }
      return shipping
    },
    items (state) {
      return state.cartItems
    }
  }
}

const cartExtend = {
  key: 'cart',
  store: { modules: [{ key: 'cart', module: extendCartVuex }] }
}

extendModule(cartExtend)
