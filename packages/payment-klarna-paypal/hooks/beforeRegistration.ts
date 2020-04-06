import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const PayPalConfirmation = () => import(/* webpackChunkName: "vsf-payment-klarna-paypal" */ '../pages/PayPalConfirmation.vue')

export function beforeRegistration ({ config }) {
  const routes = [{
    name: 'kco-paypal-response',
    path: '/paypal-confirmation',
    component: PayPalConfirmation
  }]
  setupMultistoreRoutes(config, router, routes)
}
