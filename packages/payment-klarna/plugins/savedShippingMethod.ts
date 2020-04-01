import { KlarnaPlugin, KlarnaEvents } from '../types'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

function getStorageTarget () {
  const storeView = currentStoreView()
  return storeView.storeCode + '/kco/shipping_method'
}

const plugin: KlarnaPlugin = {
  name: 'savedShippingMethod',
  beforeCreate: ({ order }) => {
    const selectedShippingMethod = localStorage.getItem(getStorageTarget())
    if (selectedShippingMethod) {
      const selectedOption = JSON.parse(selectedShippingMethod)
      order.order_lines = order.order_lines.filter(line => line.type !== 'shipping_fee')
      order.order_lines.push({
        type: 'shipping_fee',
        quantity: 1,
        name: selectedOption.name,
        total_amount: selectedOption.price,
        unit_price: selectedOption.price,
        total_tax_amount: selectedOption.tax_amount,
        tax_rate: selectedOption.tax_rate
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
  },
  on: {
    [KlarnaEvents.SHIPPING_OPTION_CHANGE] (data) {
      /* Watch shipping option event from Klarna */
      localStorage.setItem(getStorageTarget(), JSON.stringify(data))
    }
  }
}

export default plugin
