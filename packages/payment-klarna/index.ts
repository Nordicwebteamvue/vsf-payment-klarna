import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { beforeRegistration } from './hooks/beforeRegistration'
import { afterRegistration } from './hooks/afterRegistration'
import { module } from './store'

const KEY = 'kco'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  beforeRegistration,
  afterRegistration,
  store: { modules: [{ key: KEY, module }] },
}

export const KlarnaCheckout = new VueStorefrontModule(moduleConfig)
