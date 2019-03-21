# vsf-payment-klarna

```
// app config
"klarna": {
    "checkout": {
      "merchant": {
        "id": "200",
        "termsUri": "https://www.safira.com/terms-conditions",
        "checkoutUri": "https://www.safira.com/checkout/klarna",
        "confirmationUri": "https://www.safira.com/checkout/confirmation",
        "pushUri": "https://www.safira.com/checkout/push"
      }
    },
    "apiCredentials": {
      "username": "<username>",
      "password": "<password>"
    },
    "apiSecret": "test",
    "endpointLocation": "eu",
    "test": true,
    "endpoint": {
      "eu": { "live": "live_url", "test": "https://api.playground.klarna.com/" },
      "na": { "live": "live_url", "test": "test_url" }
    }
  },
  "api": {
    "endpointLocation": "eu",
    "test": false,
    "endpoint": {
      "eu": { "live": "live_url", "test": "test_url", "local": "http://localhost:8080/api/ext/vsfkco" },
      "na": { "live": "live_url", "test": "test_url" }
    }
  }
```
