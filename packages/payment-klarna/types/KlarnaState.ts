type GenericObject = { [key: string]: any }

export interface KlarnaPlugin {
  fn: (any) => KlarnaOrder
  name: string
}

interface SubState {
  loading: boolean
  snippet?: string
  orderId?: string
  error: boolean
  attempts?: number
  order?: Object
}

export default interface KlarnaState {
  confirmation: SubState
  checkout: SubState
  shippingOptions: boolean
  merchantData: Object
  purchaseCountry: string
}

export interface KlarnaProduct {
  type?: string
  reference?: string // sku
  name: string
  quantity: number
  quantity_unit?: string
  unit_price: number
  tax_rate: number
  total_amount: number
  total_discount_amount?: number
  total_tax_amount: number
  merchant_data?: string
  product_url?: string
  image_url?: string
  product_identifiers?: GenericObject
  shipping_attributes?: GenericObject
}

interface KlarnaCustomer {
  date_of_birth?: string
  type?: string
  organization_registration_id?: string
  gender?: string
}

export interface KlarnaOrder {
  orderId?: string
  purchase_country: string
  purchase_currency: string
  locale: string
  billing_address?: GenericObject
  shipping_address?: GenericObject
  order_amount: number
  order_tax_amount: number
  order_lines: Array<KlarnaProduct>
  customer?: KlarnaCustomer
  merchant_reference1?: string
  // merchant_reference2?: string // reserved for API
  options?: GenericObject
  attachment?: GenericObject
  external_payment_methods?: Array<any>
  external_checkouts?: Array<any>
  shipping_countries: Array<string>
  shipping_options: Array<any>
  merchant_data: string
  selected_shipping_option?: string
  tags?: Array<string>
}
