import { KlarnaPlugin } from '../types/KlarnaState'
import i18nNewsletter from './i18nNewsletter'
import kss from './kss'
import shippingAttributes from './shippingAttributes'
import validateOrderAmount from './validateOrderAmount'
import lastOrder from './lastOrder'
import orderId from './orderId'

export const plugins: Array<KlarnaPlugin> = []

export const defaultPlugins: Array<KlarnaPlugin> = [
  kss,
  i18nNewsletter,
  shippingAttributes,
  validateOrderAmount,
  lastOrder,
  orderId,
]

export function addPlugin (plugin: KlarnaPlugin) {
  plugins.push(plugin)
}
