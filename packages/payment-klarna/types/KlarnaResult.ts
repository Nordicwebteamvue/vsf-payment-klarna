import { KlarnaProduct } from './KlarnaProduct'
import { Address } from './Shared'

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  promo: string;
  price: number;
  taxAmount: number;
  taxRate: number;
  preselected: boolean;
  shippingMethod: string;
  deliveryDetails: {
    carrier: string;
    class: string;
    product: {
      name: string;
      identifier: string;
    };
    pickupLocation: {
      id: string;
      name: string;
      address: Address;
    };
    timeslot: {
      id: string;
      start: string;
      end: string;
    };
  };
  tmsReference: string;
}

interface ExternalMethod {
  name: string;
  redirectUrl: string;
  imageUrl: string;
  fee: number;
  description: string;
  countries: Array<string>;
  label: string;
}

export interface KlarnaResult {
  orderId: string;
  name: string;
  purchaseCountry: string;
  purchaseCurrency: string;
  locale: string;
  status: string;
  billingAddress: Address;
  shippingAddress: Address;
  orderAmount: number;
  orderTaxAmount: number;
  orderLines: Array<KlarnaProduct>;
  customer: {
    dateOfBirth: string;
    type: string;
    organizationRegistrationId: string;
    gender: string;
  };
  htmlSnippet: string;
  merchantReference1: string;
  merchantReference2: string;
  startedAt: string;
  completedAt: string;
  lastModifiedAt: string;
  externalPaymentMethods: Array<ExternalMethod>;
  externalCheckouts: Array<ExternalMethod>;
  shippingCountries: Array<string>;
  shippingOptions: Array<ShippingOption>;
  merchantData: string;
  merchantRequested?: {
    additionalCheckbox: boolean;
    additionalCheckboxes: Array<{
      id: string;
      checked: boolean;
    }>;
  };
  selectedShippingOption: ShippingOption;
  recurring: boolean;
  recurringToken: string;
  recurringDescription: string;
  billingCountries: Array<string>;
  tags: string;
}
