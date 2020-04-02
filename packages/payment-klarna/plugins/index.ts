import { KlarnaPlugin } from '../types'
import newsletter from './newsletter'
import shippingAttributes from './shippingAttributes'
import validateOrderAmount from './validateOrderAmount'
import lastOrder from './lastOrder'
import orderId from './orderId'
import savedShippingMethod from './savedShippingMethod'

export const plugins: Array<KlarnaPlugin> = []

export const defaultPlugins: Array<KlarnaPlugin> = [
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
