import i18n from '@vue-storefront/i18n'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const plugin: KlarnaPlugin = {
  name: 'newsletter',
  beforeCreate: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    const {options} = order
    console.log('options', options)
    if (options && options.additional_checkboxes) {
      options.additional_checkboxes.forEach(checkbox => {
        if (checkbox.id === 'newsletter_opt_in') {
          checkbox.text = i18n.t(checkbox.text)
        }
      })
    }
    order.options = options
    return order
  },
  onConfirmation: ({result}) => {
    const checkboxes = result.merchant_requested && result.merchant_requested.additional_checkboxes
    if (checkboxes) {
      const newsletter = checkboxes.find(({ id }) => id === 'newsletter_opt_in')
      if (newsletter && newsletter.checked) {
        EventBus.$emit('newsletter-signup', {
          email: result.billing_address.email
        })
      }
    }
  }
}

export default plugin
