interface SubState {
  loading: Boolean;
  snippet?: String;
  scriptsTags: any;
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
