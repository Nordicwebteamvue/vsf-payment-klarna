import buttonColor from './buttonColor'
import i18nNewsletter from './i18nNewsletter'
import kss from './kss'
import shippingAttributes from './shippingAttributes'
import { KlarnaPlugin } from '../types/CheckoutState'

const plugins: Array<KlarnaPlugin> = [
  buttonColor,
  kss,
  i18nNewsletter,
  shippingAttributes,
]

export default plugins
