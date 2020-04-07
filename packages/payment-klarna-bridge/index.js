import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import rp from 'request-promise-native'
import humps from 'humps'
import { merchantUrls } from './middleware'

const apiStatusError = (res, e) => {
  console.log('e', e)
  const error = e.error || e.message || e
  const statusCode = e.statusCode >= 300 ? e.statusCode : 400
  apiStatus(res, { error }, statusCode)
}

module.exports = ({ config }) => {
  const api = Router()
  const headers = {
    auth: config.klarna.auth,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  api.post('/create-or-update-order', merchantUrls(config), async (req, res) => {
    const { order } = res.locals
    const { endpoints } = config.klarna
    const url = order.orderId ? `${endpoints.orders}/${order.orderId}` : endpoints.orders
    try {
      const data = await rp.post({
        ...headers,
        url,
        body: order
      })
      data.snippet = data.html_snippet
      delete data.merchant_urls
      apiStatus(res, humps.camelizeKeys(data))
    } catch (e) {
      apiStatusError(res, e)
    }
  })

  api.get('/order-id', async (req, res) => {
    try {
      if (!req.query.sid) {
        throw new Error('Missing sid')
      }
      const data = await rp.get({
        ...headers,
        url: config.klarna.endpoints.orders + '/' + req.query.sid
      })
      apiStatus(res, humps.camelizeKeys(data))
    } catch (e) {
      apiStatusError(res, e)
    }
  })

  api.post('/validate-kco-callback', async (req, res) => {
    const { cartId } = req.query
    const { orderId } = req.body
    try {
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
      apiStatus(res, data)
    } catch (e) {
      apiStatusError(res, e)
    }
  })
  return api
}
