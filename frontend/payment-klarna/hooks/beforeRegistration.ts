import { router } from '@vue-storefront/core/app'
import { RouterManager } from '@vue-storefront/core/lib/router-manager'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-klarna-confirmation" */ '../components/Confirmation.vue')
import { PayPalKcoRoutes } from '../pages/routes'

export function beforeRegistration({ Vue, store, config }) {
  const placeOrderOnConfirmation = config.klarna.placeOrderOnConfirmation || true
  RouterManager.addRoutes([
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation,
      props: {
        placeOrderOnConfirmation
      }
    }
  ], router)
  RouterManager.addRoutes(PayPalKcoRoutes, router)
  setupMultistoreRoutes(config, router, PayPalKcoRoutes)
}
