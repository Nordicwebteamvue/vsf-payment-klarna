import get from 'lodash-es/get'
import { KlarnaOrder, KlarnaPlugin } from '../types/KlarnaState'

const plugin: KlarnaPlugin = {
  name: 'shippingAttributes',
  beforeCreate: ({ config, getters }): KlarnaOrder => {
    const getValue = (attribute, item) => parseFloat(get(item.product, config.klarna.shipping_attributes[attribute], 0)) * item.qty | 0
    const order: KlarnaOrder = getters.order
    if (config.klarna.addShippingAttributes) {
      let weightOrder = 0
      let lengthOrder = 0
      let heightOrder = 0
      let widthOrder = 0

      const cartItems = getters.getTrueCartItems
      cartItems.forEach((item) => {
        weightOrder += getValue('weight', item)
        lengthOrder += getValue('length', item) * 10
        heightOrder += getValue('height', item) * 10
        widthOrder += getValue('width', item) * 10
      })
      const sumDimensionOrder = {
        weight: weightOrder.toFixed(2),
        height: heightOrder,
        length: lengthOrder,
        width: widthOrder
      }
      order.order_lines.forEach(klarnaProduct => {
        if (klarnaProduct.reference) {
          const product = getters.getTrueCartItems.find(product => product.product.sku === klarnaProduct.reference)
          let weight = getValue('weight', product)
          let height = getValue('height', product) * 10
          let width = getValue('width', product) * 10
          let length = getValue('length', product) * 10

          let tags = []

          if (config.klarna.hasOwnProperty('limitation_shipping_attributes')) {
            config.klarna.limitation_shipping_attributes.forEach((shippingMethod) => {
            const maxWeight = shippingMethod.weight
            const maxHeight = shippingMethod.height
            const maxWidth = shippingMethod.width
            const maxLength = shippingMethod.length

            let checkWeightOnly = false

            if (shippingMethod.hasOwnProperty('check_products_weight_only')) {
              Object.keys(shippingMethod.check_products_weight_only)
                .forEach(function eachKey(key) {
                  // Check if product only need to check weight only
                  if (product.hasOwnProperty('product') && shippingMethod.check_products_weight_only[key].includes(product.product[key])) {
                    checkWeightOnly = true
                  }
                })
              }

              // Currently, Klarna only supports weight for order_lines, this should be updated after Klarna added "order_weight"
              if (checkWeightOnly) {
                if ((parseFloat(sumDimensionOrder.weight) <= maxWeight)) {
                  tags.push(shippingMethod.code)
                }
              } else {
                if (
                  parseFloat(sumDimensionOrder.weight) <= maxWeight &&
                  sumDimensionOrder.height <= maxHeight &&
                  sumDimensionOrder.width <= maxWidth &&
                  sumDimensionOrder.length <= maxLength
                ) {
                  tags.push(shippingMethod.code)
                }
              }
            })
          }

          if (
            config.klarna.hasOwnProperty('freeshipping_tag') &&
            getters.isFreeShipping
          ) {
            tags.push(config.klarna.freeshipping_tag)
          }

          klarnaProduct.shipping_attributes = {
            weight: weight,
            dimensions: {
              height: height,  //mm
              width: width, //mm
              length: length //mm
            },
            tags: tags
          }
        }
      })
    }
    return order
  }
}

export default plugin
