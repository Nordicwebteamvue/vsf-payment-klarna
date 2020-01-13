import i18n from '@vue-storefront/i18n'
import { KlarnaOrder, KlarnaPlugin } from '../types/CheckoutState'

const plugin: KlarnaPlugin = {
  name: 'i18nNewsletter',
  fn: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    const options = order.options
    if (options && options.additional_checkboxes) {
      options.additional_checkboxes.forEach(checkbox => {
        if (checkbox.id === 'newsletter_opt_in') {
          checkbox.text = i18n.t(checkbox.text)
        }
      })
    }
    order.options = options
    return order
  }
}

export default plugin
