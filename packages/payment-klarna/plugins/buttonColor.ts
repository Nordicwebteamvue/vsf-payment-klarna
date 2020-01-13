import { KlarnaOrder, KlarnaPlugin } from '../types/CheckoutState'

const plugin: KlarnaPlugin = {
  name: 'buttonColor',
  fn: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    order.options = {
      ...order.options,
      color_button: '#F5D04C'
    }
    return order
  }
}

export default plugin
