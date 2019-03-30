import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { afterRegistration } from './hooks/afterRegistration'
import './extendCart'

const KEY = 'klarna-checkout'

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  afterRegistration
}

export const KlarnaCheckout = new VueStorefrontModule(moduleConfig)
