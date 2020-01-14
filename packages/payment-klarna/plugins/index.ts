import { KlarnaPlugin } from '../types/KlarnaState'
import i18nNewsletter from './i18nNewsletter'
import kss from './kss'
import shippingAttributes from './shippingAttributes'
import validateOrderAmount from './validateOrderAmount'

export const plugins: Array<KlarnaPlugin> = []

export const defaultPlugins: Array<KlarnaPlugin> = [
  kss,
  i18nNewsletter,
  shippingAttributes,
  validateOrderAmount,
]

export function addPlugin (plugin: KlarnaPlugin) {
  plugins.push(plugin)
}
