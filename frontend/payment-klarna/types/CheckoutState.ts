interface SubState {
  loading: Boolean,
  snippet?: String,
  scriptsTags: any,
  orderId?: String
}

export default interface CheckoutState {
  confirmation: SubState,
  checkout: SubState
}
