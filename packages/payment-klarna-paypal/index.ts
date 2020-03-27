import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { beforeRegistration } from './hooks/beforeRegistration'
import { module } from './store'

const KEY = 'kco-paypal-kss'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  beforeRegistration,
  store: { modules: [{ key: KEY, module }] }
}

export const KlarnaPaypal = new VueStorefrontModule(moduleConfig)
