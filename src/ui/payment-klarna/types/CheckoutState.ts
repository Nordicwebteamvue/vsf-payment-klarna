interface Order {
  order_lines: any,
  order_amount: Number,
  order_tax_amount: Number
}

interface CreatedOrder {
  id: String
}

export interface CheckoutState {
  apiUrl: String,
  order: Order,
  snippet?: String,
  createdOrder: CreatedOrder,
  loading: Boolean,
  storeView: any
}
