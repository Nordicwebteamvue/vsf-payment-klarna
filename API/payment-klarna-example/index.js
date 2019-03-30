import { apiStatus } from '../../../lib/util'
import { Router } from 'express'
import request from 'request'

function requireSid (req, res, next) {
  const {sid} = req.query
  if (!sid) {
    return apiStatus(res, 'Missing sid', 400)
  }
  next()
}

module.exports = ({ config, db }) => {
  const api = Router()

  api.get('/confirmation', requireSid, (req, res) => {
    const {sid} = req.query
    request.post({
      url: config.klarna.endpoints.orders + '/' + sid,
      auth: config.klarna.auth,
      json: true
    }, (error, response, body) => {
      if (error || body.error_code) {
        apiStatus(res, 'Klarna error', 400)
        return
      }
      console.log(body) // eslint-disable-line no-console
      // sendOrderToEcommerce(body)
      res.redirect('http://localhost:3000/thank_you')
    })
  })

  return api
}
