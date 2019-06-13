export function beforeRegistration({ Vue, config, store, isServer }) {
  const VSF_KLARNA_CODE = 'vsfklarna'

  store.dispatch('payment/addMethod', {
    'title': 'Klarna Checkout',
    'code': VSF_KLARNA_CODE,
    'cost': 0,
    'costInclTax': 0,
    'default': false,
    'offline': true
  })

  if (!Vue.prototype.$isServer) {
    let isKlarna = false
    store.watch((state) => state.checkout.paymentDetails, (_prevMethodCode: string, newMethodCode: string) => {
      isKlarna = newMethodCode === VSF_KLARNA_CODE
    })

    const invokePlaceOrder = () => {
      if (isKlarna) {
        Vue.prototype.$bus.$emit('checkout-do-placeOrder', {})
      }
    }
    Vue.prototype.$bus.$on('checkout-before-placeOrder', invokePlaceOrder)
  }
}
