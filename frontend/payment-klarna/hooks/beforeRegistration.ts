import { router } from '@vue-storefront/core/app'
import { setupMultistoreRoutes } from '@vue-storefront/core/lib/multistore'
const Confirmation = () => import(/* webpackChunkName: "vsf-klarna-confirmation" */ '../components/Confirmation.vue')

export function beforeRegistration({ Vue, store, config }) {
  const placeOrderOnConfirmation: boolean = !!config.klarna.placeOrderOnConfirmation || true
  setupMultistoreRoutes(config, router, [
    {
      name: 'klarna-confirmation',
      path: '/confirmation',
      component: Confirmation,
      props: {
        placeOrderOnConfirmation
      }
    }
  ])
}
