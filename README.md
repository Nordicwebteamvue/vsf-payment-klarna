# vsf-payment-klarna

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
yarn # set up git hooks
docker-compose up
# new tab
docker-compose exec storefront-api yarn mage2vs import
docker-compose exec storefront-api yarn restore
docker-compose exec storefront-api yarn migrate
```

Visit http://localhost:3000
