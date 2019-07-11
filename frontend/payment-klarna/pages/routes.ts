const PayPalKcoPage = () => import(/* webpackChunkName: "vsf-storyblok" */ './HandlingPayPalKCO.vue')

export const PayPalKcoRoutes = [
  {
    name: 'paypal-handling-order',
    path: '/paypal-handling-order',
    component: PayPalKcoPage
  },
]
