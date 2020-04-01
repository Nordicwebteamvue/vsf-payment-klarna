import { KlarnaPlugin } from '../types'
import newsletter from './newsletter'
import kss from './kss'
import shippingAttributes from './shippingAttributes'
import validateOrderAmount from './validateOrderAmount'
import lastOrder from './lastOrder'
import orderId from './orderId'
import savedShippingMethod from './savedShippingMethod'

export const plugins: Array<KlarnaPlugin> = []

export const defaultPlugins: Array<KlarnaPlugin> = [
  kss,
  newsletter,
  shippingAttributes,
  validateOrderAmount,
  lastOrder,
  orderId,
  savedShippingMethod
]

export function addPlugin (plugin: KlarnaPlugin) {
  plugins.push(plugin)
}
