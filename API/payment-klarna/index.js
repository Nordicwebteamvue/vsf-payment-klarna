import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'
import jwt from 'jsonwebtoken'

module.exports = ({ config, db }) => {
  const api = Router()

  api.post('/create-or-update-order', (req, res) => {
    const { order, storeCode } = req.body
    const {cartId} = req.query
    if (!order || !cartId) {
      return apiStatus(res, 'Bad Request: Missing order or cartId', 400)
    }
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(cartId)) {
      order.merchant_reference2 = jwt.decode(req.query.cartId).cartId
    } else {
      order.merchant_reference2 = cartId
    }
    const storeCodeinUrl = '{storeCode}'
    order.merchant_urls = config.klarna.merchant_urls

    // if {storeCode} key is provided in config,
    // replace with current store view string, otherwise do nothing.
    // todo: refactor this
    order.merchant_urls.terms =
      order.merchant_urls.terms.indexOf(storeCodeinUrl) !== -1 ?
      order.merchant_urls.terms.replace(storeCodeinUrl, storeCode) :
      order.merchant_urls.terms

    order.merchant_urls.checkout =
      order.merchant_urls.checkout.indexOf(storeCodeinUrl) !== -1 ?
      order.merchant_urls.checkout.replace(storeCodeinUrl, storeCode) :
      order.merchant_urls.checkout

    order.merchant_urls.confirmation =
      order.merchant_urls.confirmation.indexOf(storeCodeinUrl) !== -1 ?
      order.merchant_urls.confirmation.replace(storeCodeinUrl, storeCode) :
      order.merchant_urls.confirmation

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
