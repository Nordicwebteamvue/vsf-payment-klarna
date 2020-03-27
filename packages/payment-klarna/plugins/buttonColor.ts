import { KlarnaPlugin } from '../types'

const plugin: KlarnaPlugin = {
  name: 'buttonColor',
  beforeCreate: ({ order }) => {
    order.options = {
      ...order.options,
      color_button: '#00FF00'
    }
    return order
  }
}

export default plugin
