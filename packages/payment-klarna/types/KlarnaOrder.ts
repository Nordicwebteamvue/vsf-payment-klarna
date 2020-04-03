import { KlarnaProduct } from './KlarnaProduct'
import { Address } from './Shared'

type GenericObject = { [key: string]: any }

interface KlarnaCustomer {
  date_of_birth?: string;
  type?: string;
  organization_registration_id?: string;
  gender?: string;
}

interface ExternalPaymentMethod {
  name: string;
  redirect_url: string;
  image_url?: string;
  fee?: number;
  description?: string;
}

interface ExternalCheckout {
  name: string;
  redirect_uri: string;
  image_uri: string;
  fee: number;
}

export interface KlarnaOrder {
  orderId?: string;
  purchase_country: string;
  purchase_currency: string;
  locale: string;
  billing_address?: Address;
  shipping_address?: Address;
  order_amount: number;
  order_tax_amount: number;
  order_lines: Array<KlarnaProduct>;
  customer?: KlarnaCustomer;
  merchant_reference1?: string;
  // merchant_reference2?: string // reserved for API
  options?: GenericObject;
  attachment?: GenericObject;
  external_payment_methods: Array<ExternalPaymentMethod>;
  external_checkouts: Array<ExternalCheckout>;
  shipping_countries: Array<string>;
  shipping_options: Array<any>;
  merchant_data: string;
  selected_shipping_option?: string;
  tags?: Array<string>;
}
