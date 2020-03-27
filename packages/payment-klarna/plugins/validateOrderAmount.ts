import { KlarnaPlugin } from '../types'

const plugin: KlarnaPlugin = {
  name: 'validateOrderAmount',
  beforeCreate: ({ order }) => {
    const sum = order.order_lines.reduce((acc, line) => acc + line.total_amount, 0)
    if (order.order_amount !== sum) {
      throw new Error(`Order amount incorrect (${order.order_amount}:${sum})`)
    }
    return order
  }
}

export default plugin
