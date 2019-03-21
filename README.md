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
  "endpointLocation": "eu",
  "test": true,
  "endpoint": {
    "eu": { "live": "live_url", "test": "test_url },
    "na": { "live": "live_url", "test": "test_url" }
  }
},
"api": {
  "endpointLocation": "eu",
  "test": false,
  "endpoint": {
    "eu": {
      "live": "live_url",
      "test": "test_url",
      "local": "https://api:port/api/ext/vsfkco"
      },
    "na": {
      "live": "live_url",
      "test": "test_url",
      "local": "https://api:port/api/ext/vsfkco"
      }
  }
}
```
