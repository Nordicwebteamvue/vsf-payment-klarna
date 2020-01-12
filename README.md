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

##### Confirmation

In `YOUR_THEME/router/index.js`

```
const Confirmation = () => import(/* webpackChunkName: "kco-confirm" */ 'src/modules/payment-klarna/components/Confirmation')
let routes = [
  ...,
  { name: 'confirmation', path: '/confirmation', component: Confirmation },
]
```

### Backend

* Copy `packages/payment-klarna-bridge` to `src/api/extensions/payment-klarna-bridge`
* Add `payment-klarna-bridge` to `registeredExtensions` in `local.json`

## Development

```sh
git clone --recurse-submodules https://github.com/kodbruket/vsf-payment-klarna
cd vsf-payment-klarna
cp .docker/api/config.sample.json .docker/api/config.json
yarn # set up git hooks
docker-compose up
# new tab
make import
```

Visit http://localhost:3000

### e2e

`yarn cypress`

### Tunnel

`ssh -R vsf-payment-klarna:80:localhost:8080 serveo.net`
