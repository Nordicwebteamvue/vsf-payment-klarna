import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/KlarnaConfirmation.vue')
const PayPalKcoPage = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/HandlingPayPalKCO.vue')
const PaypalConfirmationKCO = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/ConfirmationPayPalKCO.vue')

export function beforeRegistration({ config }) {
  const routes = [
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation
    },
    {
      name: 'kco-paypal-handling-order',
      path: '/paypal-handling-order',
      component: PayPalKcoPage
    },
    {
      name: 'kco-paypal-response',
      path: '/paypal-response',
      component: PaypalConfirmationKCO
    },
  ]
  setupMultistoreRoutes(config, router, routes)
}
