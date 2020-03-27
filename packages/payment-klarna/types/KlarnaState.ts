interface SubState {
  loading: boolean;
  snippet?: string;
  orderId?: string;
  error: boolean;
  attempts?: number;
  order?: Record<string, any>;
}

export default interface KlarnaState {
  confirmation: SubState;
  checkout: SubState;
  shippingOptions: boolean;
  merchantData: Record<string, any>;
  purchaseCountry: string;
}
