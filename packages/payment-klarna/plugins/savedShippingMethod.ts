import { KlarnaPlugin } from '../types'

const plugin: KlarnaPlugin = {
  name: 'savedShippingMethod',
  beforeCreate: ({ order }) => {
    const selectedShippingMethod = localStorage.getItem('shipping_method')
    if (selectedShippingMethod) {
      const selectedOption = JSON.parse(selectedShippingMethod)
      order.order_lines = order.order_lines.filter(line => line.type !== 'shipping_fee')
      order.order_lines.push({
        ...selectedOption,
        type: 'shipping_fee',
        quantity: 1
      })
      order.selected_shipping_option = selectedOption

      let orderAmount = 0
      let orderTaxAmount = 0
      order.order_lines.forEach((orderLine) => {
        orderAmount += orderLine.total_amount
        orderTaxAmount += orderLine.total_tax_amount
      })
      order.order_amount = Math.round(orderAmount)
      order.order_tax_amount = Math.round(orderTaxAmount)
    }
    return order
  }
}

export default plugin
