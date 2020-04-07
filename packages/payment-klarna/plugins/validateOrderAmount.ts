import { KlarnaPlugin } from '../types'

const plugin: KlarnaPlugin = {
  name: 'validateOrderAmount',
  beforeCreate: ({ order }) => {
    const sum = order.orderLines.reduce((acc, line) => acc + line.totalAmount, 0)
    if (order.orderAmount !== sum) {
      throw new Error(`Order amount incorrect (${order.orderAmount}:${sum})`)
    }
    return order
  }
}

export default plugin
