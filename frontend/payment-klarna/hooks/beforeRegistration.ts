import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../components/Confirmation.vue')
import { PayPalKcoRoutes } from '../pages/routes'

export function beforeRegistration({ Vue, store, config }) {
  const placeOrderOnConfirmation = config.klarna.placeOrderOnConfirmation || true
  const routes = [
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation,
      props: {
        placeOrderOnConfirmation
      }
    }
  ]
  setupMultistoreRoutes(config, router, routes)
  setupMultistoreRoutes(config, router, PayPalKcoRoutes)
}
