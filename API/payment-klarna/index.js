import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'
import jwt from 'jsonwebtoken'

function addStoreCode (merchantUrls, storeCode = '', dataSourceStoreCode = '') {
  Object.keys(merchantUrls).forEach(url => {
    if (merchantUrls[url].includes('{{storeCode}}')) {
      merchantUrls[url] = merchantUrls[url]
        .replace('{{storeCode}}', storeCode)
        .replace(/([^:]\/)\/+/g, '$1') // eslint-disable-line camelcase
    }
    if (merchantUrls[url].includes('{{dataSourceStoreCode}}')) {
      merchantUrls[url] = merchantUrls[url]
        .replace('{{dataSourceStoreCode}}', dataSourceStoreCode)
        .replace(/([^:]\/)\/+/g, '$1') // eslint-disable-line camelcase
    }
  })
}

module.exports = ({ config, db }) => {
  const api = Router()
  api.post('/create-or-update-order', (req, res) => {
    const { order, storeCode, dataSourceStoreCode, orderId } = req.body
    const { cartId } = req.query
    if (!order || !cartId) {
      return apiStatus(res, 'Bad Request: Missing order or cartId', 400)
    }
    if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(cartId)) {
      order.merchant_reference2 = jwt.decode(req.query.cartId).cartId
    } else {
      order.merchant_reference2 = cartId
    }
    const {auth, endpoints} = config.klarna
    order.merchant_urls = {...config.klarna.merchant_urls}
    if (storeCode && config.storeViews[storeCode] && config.storeViews[storeCode].merchant_urls) {
      order.merchant_urls = {
        ...order.merchant_urls,
        ...config.storeViews[storeCode].merchant_urls
      }
    }
    addStoreCode(order.merchant_urls, storeCode, dataSourceStoreCode)
    const url = orderId ? endpoints.orders + '/' + orderId : endpoints.orders
    request.post({
      url,
      auth,
      body: order,
      json: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      if (error || body.error_code || response.statusCode >= 300) {
        const statusCode = response.statusCode !== 200 ? response.statusCode : 400
        apiStatus(res, {
          error: 'Klarna error',
          body,
          order
        }, statusCode)
        return
      }
      body.snippet = body.html_snippet
      apiStatus(res, body)
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

  api.post('/validate-kco-callback', (req, res) => {
    const { cartId } = req.query
    const { orderId } = req.body
    if (cartId && orderId) {
      const body = {
        quote: {
          klarna_order_id: orderId
        }
      }
      const klarnaApiUrl = config.klarna.endpoints.validate_order.replace('{{cartId}}', cartId)
      request.post({
        url: klarnaApiUrl,
        json: true,
        body
      }, (error, response, body) => {
        if (error || body.error_code) {
          apiStatus(res, `Error: ${error || body.error_code}`, 400)
          return
        }
        if (body.error) {
          apiStatus(res, body, 400)
          return
        }
        apiStatus(res, body)
      })
    } else {
      apiStatus(res, `error`, 400)
    }
  })

  return api
}
