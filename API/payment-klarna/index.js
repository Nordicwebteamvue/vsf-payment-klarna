import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'
import jwt from 'jsonwebtoken'

module.exports = ({ config, db }) => {
  const api = Router()

  api.post('/create-or-update-order', (req, res) => {
    const {order} = req.body
    const {cartId} = req.query
    if (!order || !cartId) {
      return apiStatus(res, 'Bad Request: Missing order or cartId', 400)
    }
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(cartId)) {
      order.merchant_reference2 = jwt.decode(req.query.cartId).cartId
    } else {
      order.merchant_reference2 = cartId
    }
    order.merchant_urls = config.klarna.merchant_urls
    request.post({
      url: config.klarna.endpoints.orders,
      auth: config.klarna.auth,
      body: order,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      if (error || body.error_code) {
        apiStatus(res, {
          error: 'Klarna error',
          body,
          order
        }, 400)
        return
      }
      apiStatus(res, {orderId: body.order_id, snippet: body.html_snippet})
    })
  })

  api.get('/order-id', (req, res) => {
    const {sid} = req.query
    if (!sid) {
      apiStatus(res, 'Missing sid', 400)
      return
    }
    request.get({
      url: config.klarna.endpoints.orders + '/' + sid,
      auth: config.klarna.auth,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      if (error) {
        apiStatus(res, 'Klarna error', 400)
        return
      }
      apiStatus(res, body)
    })
  })

  api.post('/retrieve', (req, res) => {
    const klarnaApiUrl = req.body.klarnaApiUrl
    if (!klarnaApiUrl) {
      return apiStatus(res, 'Bad Request', 400)
    }
    request.get({
      url: klarnaApiUrl,
      auth: config.klarna.auth
    }, (error, response, body) => {
      if (error || body.error_code) {
        apiStatus(res, `Klarna error: ${body.error_code}`, 400)
        return
      }
      apiStatus(res, {snippet: body.html_snippet})
    })
  })

  api.post('/update', (req, res) => {
    const klarnaApiUrl = req.body.klarnaApiUrl
    const order = req.body.order
    if (!klarnaApiUrl || !order) {
      return apiStatus(res, 'Bad Request', 400)
    }

    request.post({
      url: klarnaApiUrl,
      json: true,
      body: order,
      auth: config.klarna.auth
    }, (error, response, body) => {
      if (error || body.error_code) {
        apiStatus(res, `Klarna error: ${body.error_code}`, 400)
        return
      }
      apiStatus(res, {orderId: body.order_id, snippet: body.html_snippet})
    })
  })

  return api
}
