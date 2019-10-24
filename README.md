# vsf-payment-klarna

## Usage

### Prefill country

`this.$store.dispatch('kco/setPurchaseCountry', 'SE')`

### Development

`/etc/hosts`

```
127.0.0.1	storefront-api
127.0.0.1	redis
127.0.0.1	elasticsearch
```

```sh
git clone --recurse-submodules https://github.com/kodbruket/vsf-payment-klarna
cd vsf-payment-klarna
cp API/config.sample.json API/config.json
yarn # set up git hooks
docker-compose up
# new tab
docker-compose exec storefront-api yarn mage2vs import
docker-compose exec storefront-api yarn restore
docker-compose exec storefront-api yarn migrate
```

Visit http://localhost:3000

#### e2e

`yarn cypress`

#### Tunnel

`ssh -R vsf-payment-klarna:80:localhost:8080 serveo.net`
