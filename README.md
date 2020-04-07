# vsf-payment-klarna ![for VSF 1.11](https://img.shields.io/static/v1?label=vsf&message=1.11&color=brightgreen) ![](https://github.com/kodbruket/vsf-payment-klarna/workflows/Tests/badge.svg)

  * [Frontend](#frontend)
    + [Installation](#installation)
    + [Config](#config)
    + [Checkout](#checkout)
    + [Confirmation page](#confirmation-page)
    + [Plugins](#plugins)
  * [API](#api)
    + [Installation](#installation-1)
    + [Config](#config-1)
  * [Magento 2](#magento-2)
- [Development](#development)
  * [Requirements](#requirements)
  * [Get started](#get-started)
  * [e2e](#e2e)
  * [Tunnel](#tunnel)

## Frontend

### Installation

* Copy `packages/payment-klarna` to `src/modules/payment-klarna`
* Update `modules/client.ts` with the following:
  ```
  import { KlarnaCheckout } from './payment-klarna'
  ...
  export const registerModules: VueStorefrontModule[] = [
    ...,
    KlarnaCheckout
  ]
  ```

### Config

> See [config.json](.docker/frontend/config.json) for example config

#### `klarna.create`

Endpoint for creating order (vsf-api)

#### `klarna.confirmation`

Endpoint for retrieving Klana confirmation snippet (vsf-api)

#### `klarna.validate_order`

Endpoint called when order total changes (vsf-api)

#### `klarna.showShippingOptions`

If set to true available shipping methods will be sent to Klarna and enable Klarnas shipping method form

#### `klarna.options`

https://developers.klarna.com/api/#checkout-api__create-a-new-order__options

> Some plugins might use other keys

### Checkout

In `theme/pages/Checkout.vue`

```
import KCO from 'src/modules/payment-klarna/components/KlarnaCheckout'

export {
  ...,
  components: {
    klarna-checkout: KCO
  }
}
```

And then just `<klarna-checkout />` where you want to render it

### Confirmation page

Will be found at `www.example.com/confirmation` and `www.example.com/STORECODE/confirmation`

See [beforeRegistration.ts](packages/payment-klarna/hooks/beforeRegistration.ts) for more info

### Plugins

If you need to extend this library you most likely don't need to fork it, just create a plugin!

There's a few default plugins already made. See the [plugins folder](packages/payment-klarna/plugins) for README and inspiration.

## API

### Installation

* Copy `packages/payment-klarna-bridge` to `src/api/extensions/payment-klarna-bridge`
* Add `payment-klarna-bridge` to `registeredExtensions` in `local.json`

### Config

> See [config.json](.docker/api/config.json) for example config

#### `klarna.merchant_urls`

> Klarna docs: https://developers.klarna.com/api/#checkout-api__create-a-new-order__merchant_urls

Alongside Klarnas variables (`{checkout.order.id}`, `{checkout.order.url}` and/or `{checkout.order.uri}`) you can also use `{{sourceCode}}` which will be replaced `currentStoreView().storeCode` and `{{dataSourceCode}}` which will be replaced `currentStoreView().dataSourceCode` (useful if you need a different field for the url).

#### `klarna.auth`

Your Klarna auth credentials

```json
"auth": {
  "user": "PK0123_something",
  "pass": "password"
},
```

#### `klarna.endpoints`

```json
"endpoints": {
  "order": "https://api.something.klarna.com", // pick from https://developers.klarna.com/api/#api-urls
  // TODO: Integrate to magento2-vsf-kco module
  "validate_order": "" // will be called when total amount changes
},
```
https://developers.klarna.com/api/#api-urls

## Magento 2

Please use this module: https://github.com/kodbruket/magento2-vsf-kco

# Development

## Requirements

* Node 10+ (https://nodejs.org/en/download/)
* Yarn (https://yarnpkg.com/en/docs/install)
* Docker (https://docs.docker.com/v17.09/engine/installation/)
* `docker-compose` (https://docs.docker.com/compose/install/)

> **Protip:** On Mac run, install Docker and Brew then run `brew install node && brew install yarn && brew install docker-compose`

## Get started

```sh
git clone --recurse-submodules https://github.com/kodbruket/vsf-payment-klarna
cd vsf-payment-klarna
yarn # set up git hooks
docker-compose up
# new tab
make es-restore # seed Magento catalog data
```

Visit http://localhost:3000

## e2e

`yarn cypress`

## Tunnel

`ssh -R vsf-payment-klarna:80:localhost:8080 serveo.net`
