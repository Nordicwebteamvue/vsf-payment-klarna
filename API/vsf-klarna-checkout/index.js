import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'

module.exports = ({ config, db }) => {
  const api = Router()

  api.post('/create', (req, res) => {
    console.log('VSF API: create')
    const klarnaApiUrl = req.body.klarnaApiUrl
    const order = req.body.order
    const agent = req.body.userAgent
    if (!klarnaApiUrl || !order) {
      return apiStatus(res, 'Bad Request', 400)
    }

    console.log('Starting klarna create request to: ', klarnaApiUrl)
    console.log('User agent: ', agent)
    console.log('create order: ', order)
    request.post({
      url: klarnaApiUrl,
      body: order,
      json: true,
      'auth': {
        'user': '<user>',
        'pass': '<password>'
      },
      headers: {
        'User-Agent': agent,
        'Content-Type': 'application/json'
      }
    }, (error, response, body) => {
      console.log('callback error: ', error)
      console.log('create klarna body: ', body)
      console.log('klarna response object: ', response)
      if (error || body.error_code) {
        apiStatus(res, `Klarna error: ${body.error_code}`, 400)
        return
      }
      console.log('all ok!')
      apiStatus(res, {orderId: body.order_id, snippet: body.html_snippet})
    })
  })

  api.post('/retrieve', (req, res) => {
    console.log('VSF API: retrieve')
    const klarnaApiUrl = req.body.klarnaApiUrl
    if (!klarnaApiUrl) {
      console.log('klarna api url: ', klarnaApiUrl)
      console.log('req body: ', req.body)
      return apiStatus(res, 'Bad Request', 400)
    }
    console.log('begin request')
    request.get({
      url: klarnaApiUrl,
      'auth': {
        'user': '<user>',
        'pass': '<password>'
      }
    }, (error, response, body) => {
      console.log('retrieve klarna body: ', body)
      if (error || body.error_code) {
        apiStatus(res, `Klarna error: ${body.error_code}`, 400)
        return
      }
      apiStatus(res, {snippet: body.html_snippet})
    })
  })

  api.post('/update', (req, res) => {
    console.log('VSF API: update')
    const klarnaApiUrl = req.body.klarnaApiUrl
    const order = req.body.order
    if (!klarnaApiUrl || !order) {
      return apiStatus(res, 'Bad Request', 400)
    }

    console.log('Starting klarna update request')

    request.post({
      url: klarnaApiUrl,
      json: true,
      body: order,
      'auth': {
        'user': '<user>',
        'pass': '<password>'
      }
    }, (error, response, body) => {
      console.log('update klarna body: ', body)
      console.log('klarna response object: ', response)
      if (error || body.error_code) {
        apiStatus(res, `Klarna error: ${body.error_code}`, 400)
        return
      }
      console.log('all ok!')
      apiStatus(res, {orderId: body.order_id, snippet: body.html_snippet})
    })
  })

  api.post('/push', (req, res) => {
    if (!req.query.checkout_uri) {
      console.log(req)
      // send response to appropriate error handler for logging
      // ...

      apiStatus(res, 'Bad Request', 400)
    }
    const orderId = req.query.checkout_uri
    console.log('order id: ', orderId)

    /*
      send the order id to whatever integration we're running
      so that it can confirm the order with Klarna, i.e:

      var gateway = ecommerceRestClient.connect({
        auth: <auth>
      })

      gateway.transaction.order({
        order_id: orderId
      })
    */

    apiStatus(res)
  })

  return api
}
