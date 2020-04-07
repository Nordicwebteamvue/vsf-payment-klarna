import { KlarnaProduct } from './KlarnaProduct'
import { Address } from './Shared'

type GenericObject = { [key: string]: any }

interface KlarnaCustomer {
  dateOfBirth?: string;
  type?: string;
  organizationRegistrationId?: string;
  gender?: string;
}

interface ExternalPaymentMethod {
  name: string;
  redirectUrl: string;
  imageUrl?: string;
  fee?: number;
  description?: string;
}

interface ExternalCheckout {
  name: string;
  redirectUri: string;
  imageUri: string;
  fee: number;
}

enum ShippingMethod {
  PickUpStore = 'PickUpStore',
  Home = 'Home',
  BoxReg = 'BoxReg',
  BoxUnreg = 'BoxUnreg',
  PickUpPoint = 'PickUpPoint',
  Own = 'Own',
  Postal = 'Postal',
  DHLPackstation = 'DHLPackstation',
  Digital = 'Digital',
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  promo?: string;
  price: number;
  taxAmount: number;
  taxRate: number;
  preselected?: boolean;
  shippingMethod?: ShippingMethod;
}

export interface KlarnaOrder {
  orderId?: string;
  purchaseCountry: string;
  purchaseCurrency: string;
  locale: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  orderAmount: number;
  orderTaxAmount: number;
  orderLines: Array<KlarnaProduct>;
  customer?: KlarnaCustomer;
  merchantReference1?: string;
  // merchantReference2?: string // reserved for API
  options?: GenericObject;
  attachment?: GenericObject;
  externalPaymentMethods: Array<ExternalPaymentMethod>;
  externalCheckouts: Array<ExternalCheckout>;
  shippingCountries: Array<string>;
  shippingOptions: Array<ShippingOption>;
  merchantData: string;
  selectedShippingOption?: string;
  tags?: Array<string>;
}
