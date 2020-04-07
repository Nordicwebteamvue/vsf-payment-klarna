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
      order.orderLines = order.orderLines.filter(line => line.type !== 'shipping_fee')
      order.orderLines.push({
        type: 'shipping_fee',
        quantity: 1,
        name: selectedOption.name,
        totalAmount: selectedOption.price,
        unitPrice: selectedOption.price,
        totalTaxAmount: selectedOption.tax_amount,
        taxRate: selectedOption.tax_rate
      })
      order.selectedShippingOption = selectedOption

      let orderAmount = 0
      let orderTaxAmount = 0
      order.orderLines.forEach((orderLine) => {
        orderAmount += orderLine.totalAmount
        orderTaxAmount += orderLine.totalTaxAmount
      })
      order.orderAmount = Math.round(orderAmount)
      order.orderTaxAmount = Math.round(orderTaxAmount)
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
