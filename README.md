# vsf-payment-klarna

```
"klarna": {
  "checkout": {
    "merchant": {
      "id": "200",
      "termsUri": "<terms uri>",
      "checkoutUri": "<checkout uri>",
      "confirmationUri": "<confirmation uri>",
      "pushUri": "<push uri>"
    }
  },
  "apiCredentials": {
    "username": "<username>",
    "password": "<password>"
  },
  "apiSecret": "test",
  "endpoints": {
    "orders": "https://api.playground.klarna.com/checkout/v3/orders"
  }
},
"vsfapi": {
  "endpoints": {
    "create": "http://localhost:8080/api/ext/vsf-klarna-checkout/create",
    "update": "http://localhost:8080/api/ext/vsf-klarna-checkout/update",
    "retrieve": "http://localhost:8080/api/ext/vsf-klarna-checkout/retrieve"
  }
}
```

### Development

```sh
git clone --recurse-submodules https://github.com/kodbruket/vsf-payment-klarna
cd vsf-payment-klarna
yarn # set up git hooks
docker-compose up
# new tab
docker-compose exec storefront-api sh -c "yarn mage2vs import && \
  yarn restore && \
  yarn migrate"
```

Visit http://localhost:3000
