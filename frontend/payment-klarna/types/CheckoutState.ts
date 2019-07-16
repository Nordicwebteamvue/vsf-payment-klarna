interface SubState {
  loading: Boolean;
  snippet?: String;
  scriptsTags: any;
  orderId?: String;
  error: Boolean;
}

export default interface CheckoutState {
  confirmation: SubState;
  checkout: SubState;
  shippingOptions: Boolean;
  merchantData: Object;
}
