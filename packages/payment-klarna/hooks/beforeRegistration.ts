import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-payment-klarna" */ '../pages/KlarnaConfirmation.vue')

export function beforeRegistration ({ config }) {
  const routes = [
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation
    }
  ]
  setupMultistoreRoutes(config, router, routes)
}
