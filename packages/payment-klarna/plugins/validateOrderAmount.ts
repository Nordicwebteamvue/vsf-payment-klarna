import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const plugin: KlarnaPlugin = {
  name: 'validateOrderAmount',
  fn: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    let sum = order.order_lines.reduce((acc, line) => acc + line.total_amount, 0)
    if (order.order_amount !== sum) {
      throw new Error(`Order amount incorrect (${order.order_amount}:${sum})`)
    }
    return order
  }
}

export default plugin
