import { VueStorefrontModule, VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { afterRegistration } from './hooks/afterRegistration'
import { initCacheStorage } from '@vue-storefront/core/helpers/initCacheStorage'
import './extendCart'

const KEY = 'klarna-checkout'
export const cacheStorage = initCacheStorage(KEY)

const moduleConfig: VueStorefrontModuleConfig = {
  key: KEY,
  afterRegistration
}

export const KlarnaCheckout = new VueStorefrontModule(moduleConfig)
