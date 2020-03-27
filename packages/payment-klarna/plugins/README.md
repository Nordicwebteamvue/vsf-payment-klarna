# Plugins

## Example

```ts
import { KlarnaPlugin } from 'src/modules/payment-klarna/types'

const plugin: KlarnaPlugin = {
  name: 'myPlugin',

  beforeCreate: ({ order, getters, state, config }) => {
    // This function is run right before we send the order to Klarna.
    // Here we change the button color
    order.options = {
      ...order.options,
      color_button: '#00FF00'
    }
    return order
  },

  afterCreate: ({ result, order }) => {
    // This is run right after the order is created.
    // result is the response from Klarna
    localStorage.setItem('kco/last-order', JSON.stringify(order))
  },

  onConfirmation: ({ result, dispatch, getters }) => {
    // This is run on the confirmation page
    // Useful for doing stuff after confirmed payments i.e. newsletter signup
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
```

### Load plugin

```ts
// App.vue
import myPlugin from 'theme/plugins/myPlugin'

export default {
  ...,
  mounted () {
    // Add myPlugin
    this.$store.dispatch('kco/addPlugin', myPlugin)
  }
}
```
