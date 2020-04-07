
import jwt from 'jsonwebtoken'
import humps from 'humps'

function addStoreCode (merchantUrls, storeCode = '', dataSourceStoreCode = '') {
  Object.keys(merchantUrls).forEach(url => {
    if (merchantUrls[url].includes('{{storeCode}}')) {
      merchantUrls[url] = merchantUrls[url]
        .replace('{{storeCode}}', storeCode)
        .replace(/([^:]\/)\/+/g, '$1')
    }
    if (merchantUrls[url].includes('{{dataSourceStoreCode}}')) {
      merchantUrls[url] = merchantUrls[url]
        .replace('{{dataSourceStoreCode}}', dataSourceStoreCode)
        .replace(/([^:]\/)\/+/g, '$1')
    }
  })
}

const maybeDecodeCartId = cartId => {
  if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(cartId)) {
    return jwt.decode(cartId).cartId
  } else {
    return cartId
  }
}

export const merchantUrls = config => function (req, res, next) {
  const { order, storeCode, dataSourceStoreCode } = req.body
  const { cartId } = req.query
  if (!order || !cartId) {
    throw new Error('Bad Request: Missing order or cartId')
  }
  order.merchant_urls = { ...config.klarna.merchant_urls }
  if (storeCode && config.storeViews[storeCode] && config.storeViews[storeCode].merchant_urls) {
    order.merchant_urls = {
      ...order.merchant_urls,
      ...config.storeViews[storeCode].merchant_urls
    }
  }
  addStoreCode(order.merchant_urls, storeCode, dataSourceStoreCode)
  order.merchant_reference2 = maybeDecodeCartId(cartId)
  res.locals.order = humps.decamelizeKeys(order)
  next()
}
