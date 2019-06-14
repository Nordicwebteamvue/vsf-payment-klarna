export function beforeRegistration({ Vue, store }) {
  const VSF_KLARNA_CODE = 'klarna_kp'

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
