const PayPalKcoPage = () => import(/* webpackChunkName: "vsf-payment-klarna" */ './HandlingPayPalKCO.vue')
const PaypalConfirmationKCO = () => import(/* webpackChunkName: "vsf-payment-klarna" */ './ConfirmationPayPalKCO.vue')

export const PayPalKcoRoutes = [
  {
    name: 'paypal-handling-order',
    path: '/paypal-handling-order',
    component: PayPalKcoPage
  },
  {
    name: 'paypal-response',
    path: '/paypal-response',
    component: PaypalConfirmationKCO
  },
]
