# vsf-payment-klarna ![for VSF 1.11](https://img.shields.io/static/v1?label=vsf&message=1.11&color=brightgreen)

## Installation

### Frontend

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

#### Usage

> See [config.json](.docker/frontend/config.json) for example config

##### Checkout

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

##### Confirmation page

Will be found at `www.example.com/confirmation` and `www.example.com/STORECODE/confirmation`

See [beforeRegistration.ts](packages/payment-klarna/hooks/beforeRegistration.ts) for more info

##### Plugins

There's a few default plugins already made. See [plugins](packages/payment-klarna/plugins).

### Backend

* Copy `packages/payment-klarna-bridge` to `src/api/extensions/payment-klarna-bridge`
* Add `payment-klarna-bridge` to `registeredExtensions` in `local.json`

See [config.json](.docker/api/config.json) for example config

## Development

### Requirements

* Node 10+ (https://nodejs.org/en/download/)
* Yarn (https://yarnpkg.com/en/docs/install)
* Docker (https://docs.docker.com/v17.09/engine/installation/)
* `docker-compose` (https://docs.docker.com/compose/install/)

> **Protip:** On Mac run, install Docker and Brew then run `brew install node && brew install yarn && brew install docker-compose`

```sh
git clone --recurse-submodules https://github.com/kodbruket/vsf-payment-klarna
cd vsf-payment-klarna
yarn # set up git hooks
docker-compose up
# new tab
make es-restore # seed Magento catalog data
```

Visit http://localhost:3000

### e2e

`yarn cypress`

### Tunnel

`ssh -R vsf-payment-klarna:80:localhost:8080 serveo.net`
