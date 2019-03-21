import * as types from './../store/mutation-types'

export function afterRegistration({ Vue, store, isServer }) {
  if (!isServer) store.dispatch('cart/load')

  store.subscribe((mutation, state) => {
    const type = mutation.type

    if (
      type.endsWith(types.CART_ADD_ITEM) || 
      type.endsWith(types.CART_DEL_ITEM) || 
      type.endsWith(types.CART_UPD_ITEM) 
      ) {
      Vue.prototype.$bus.$emit('updateKlarnaOrder')
    }
  })
}
