import { Router } from 'express'
import rp from 'request-promise-native'
import { merchantUrls } from './middleware'
import { genereateHeaders, wrap } from './helpers'

module.exports = ({ config }) => {
  const api = Router()
  const headers = genereateHeaders(config)

  const upsertOrder = async (req, res) => {
    const { order } = res.locals
    const { endpoints } = config.klarna
    const url = order.orderId ? `${endpoints.orders}/${order.orderId}` : endpoints.orders
    const data = await rp.post({
      ...headers,
      url,
      body: order
    })
    data.snippet = data.html_snippet
    return data
  }

  const getOrder = async (req) => {
    if (!req.query.sid) {
      throw new Error('Missing sid')
    }
    const data = await rp.get({
      ...headers,
      url: config.klarna.endpoints.orders + '/' + req.query.sid
    })
    return data
  }

  const validateKcoCallback = async (req) => {
    const { cartId } = req.query
    const { orderId } = req.body
    if (!(cartId && orderId)) {
      throw new Error('Missing cartId or orderId')
    }
    const klarnaApiUrl = config.klarna.endpoints.validate_order && config.klarna.endpoints.validate_order.replace('{{cartId}}', cartId)
    if (!klarnaApiUrl) {
      throw new Error('Missing validate_order URL')
    }
    const data = await rp.post({
      url: klarnaApiUrl,
      json: true,
      body: {
        quote: {
          klarna_order_id: orderId
        }
      }
    })
    return data
  }

  api.get('/confirmation', wrap(getOrder))
  api.post('/upsert-order', merchantUrls(config), wrap(upsertOrder))
  api.post('/validate-order', wrap(validateKcoCallback))

  // Deprecated
  api.get('/order-id', wrap(getOrder))
  api.post('/create-or-update-order', merchantUrls(config), wrap(upsertOrder))
  api.post('/validate-kco-callback', wrap(validateKcoCallback))
  return api
}
