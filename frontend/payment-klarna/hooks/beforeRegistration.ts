import { router } from '@vue-storefront/core/app'
import { RouterManager } from '@vue-storefront/core/lib/router-manager'
const Confirmation = () => import(/* webpackChunkName: "vsf-klarna-confirmation" */ '../components/Confirmation.vue')

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
}
