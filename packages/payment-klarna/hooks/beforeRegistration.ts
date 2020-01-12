import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/KlarnaConfirmation.vue')
const PayPalKcoPage = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/HandlingPayPalKCO.vue')
const PaypalConfirmationKCO = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/ConfirmationPayPalKCO.vue')

export function beforeRegistration({ config }) {
  const placeOrderOnConfirmation = config.klarna.placeOrderOnConfirmation || true
  const routes = [
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation,
      props: {
        placeOrderOnConfirmation
      }
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
