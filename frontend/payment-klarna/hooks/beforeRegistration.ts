import { router } from '@vue-storefront/core/app'
import { RouterManager } from '@vue-storefront/core/lib/router-manager'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../components/Confirmation.vue')
import { PayPalKcoRoutes } from '../pages/routes'

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
    }
  ]
  RouterManager.addRoutes(routes, router)
  setupMultistoreRoutes(config, router, routes)
  RouterManager.addRoutes(PayPalKcoRoutes, router)
  setupMultistoreRoutes(config, router, PayPalKcoRoutes)
}
