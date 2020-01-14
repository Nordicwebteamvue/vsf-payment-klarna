import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const plugin: KlarnaPlugin = {
  name: 'buttonColor',
  beforeCreate: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    order.options = {
      ...order.options,
      color_button: '#00FF00'
    }
    return order
  }
}

export default plugin
