# vsf-payment-klarna

## Installation

### Frontend

* Copy `packages/payment-klarna` to `src/modules/payment-klarna`
* Update `modules/index.ts` with the following:
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
docker-compose exec storefront-api yarn mage2vs import
docker-compose exec storefront-api yarn restore
docker-compose exec storefront-api yarn migrate
```

Visit http://localhost:3000

### e2e

`yarn cypress`

### Tunnel

`ssh -R vsf-payment-klarna:80:localhost:8080 serveo.net`
