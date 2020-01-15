import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const target = 'kco/order-id'

const plugin: KlarnaPlugin = {
  name: 'orderId',
  beforeCreate: ({ getters }): KlarnaOrder => {
    const order: KlarnaOrder = getters.order
    const maybeJson = localStorage.getItem(target)
    if (maybeJson) {
      const json = JSON.parse(maybeJson)
      if (json.expires > Date.now()) {
        order.orderId = json.orderId
      } else {
        localStorage.removeItem(target)
      }
    }
    return order
  },
  afterCreate: ({ result }) => {
    const klarnaOrderIdExpires = new Date();
    klarnaOrderIdExpires.setDate(klarnaOrderIdExpires.getDate() + 2);
    localStorage.setItem(target, JSON.stringify({
      orderId: result.order_id,
      expires: klarnaOrderIdExpires.getTime()
    }))
  },
  onConfirmation: () => {
    localStorage.removeItem(target)
  }
}

export default plugin
