interface SubState {
  loading: Boolean;
  snippet?: String;
  orderId?: String;
  error: Boolean;
  attempts?: Number;
  order?: Object;
}

export default interface CheckoutState {
  confirmation: SubState;
  checkout: SubState;
  shippingOptions: Boolean;
  merchantData: Object;
  purchaseCountry: String;
}
