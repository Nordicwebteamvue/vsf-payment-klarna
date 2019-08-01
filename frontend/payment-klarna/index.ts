import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { afterRegistration } from './hooks/afterRegistration'
import { beforeRegistration } from './hooks/beforeRegistration'
import './extendCart'
import { module } from './store'

const KEY = 'kco'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  beforeRegistration,
  store: { modules: [{ key: KEY, module }] },
}

export const KlarnaCheckout = new VueStorefrontModule(moduleConfig)
