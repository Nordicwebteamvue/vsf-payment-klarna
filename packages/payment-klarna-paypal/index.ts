import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { beforeRegistration } from './hooks/beforeRegistration'

const KEY = 'kco-paypal-kss'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  beforeRegistration
}

export const KlarnaPaypal = new VueStorefrontModule(moduleConfig)
