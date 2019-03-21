# vsf-payment-klarna

```
// app config
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
