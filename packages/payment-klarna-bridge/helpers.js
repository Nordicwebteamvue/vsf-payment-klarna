import humps from 'humps'
import { apiStatus } from '../../../lib/util'

export const apiStatusError = (res, e) => {
  const error = e.error || e.message || e
  const statusCode = e.statusCode >= 300 ? e.statusCode : 400
  apiStatus(res, { error }, statusCode)
}

export const transformData = data => {
  data = humps.camelizeKeys(data)
  delete data.merchantUrls
  return data
}

export const wrap = fn => async (req, res) => {
  try {
    const data = await fn(req, res)
    apiStatus(res, transformData(data))
  } catch (e) {
    apiStatusError(res, e)
  }
}

export const genereateHeaders = (config) => ({
  auth: config.klarna.auth,
  json: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export {
  apiStatus
}
