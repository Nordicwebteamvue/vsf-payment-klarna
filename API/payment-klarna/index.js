import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'

module.exports = ({ config, db }) => {
  const api = Router()

  api.post('/create-or-update-order', (req, res) => {
    const {order, agent} = req.body
    if (!order) {
      return apiStatus(res, 'Bad Request', 400)
    }
    request.post({
      url: config.klarna.endpoints.orders,
      auth: config.klarna.auth,
      body: order,
      json: true,
      headers: {
        'User-Agent': agent,
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      if (error || body.error_code) {
        apiStatus(res, 'Klarna error', 400)
        return
      }
      apiStatus(res, {orderId: body.order_id, snippet: body.html_snippet})
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
