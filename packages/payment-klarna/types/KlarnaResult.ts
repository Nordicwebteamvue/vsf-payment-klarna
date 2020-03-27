import { KlarnaProduct } from './KlarnaProduct'
import { Address } from './Shared'

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  promo: string;
  price: number;
  tax_amount: number;
  tax_rate: number;
  preselected: boolean;
  shipping_method: string;
  delivery_details: {
    carrier: string;
    class: string;
    product: {
      name: string;
      identifier: string;
    };
    pickup_location: {
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
  tms_reference: string;
}

interface ExternalMethod {
  name: string;
  redirect_url: string;
  image_url: string;
  fee: number;
  description: string;
  countries: Array<string>;
  label: string;
}

export interface KlarnaResult {
  order_id: string;
  name: string;
  purchase_country: string;
  purchase_currency: string;
  locale: string;
  status: string;
  billing_address: Address;
  shipping_address: Address;
  order_amount: number;
  order_tax_amount: number;
  order_lines: Array<KlarnaProduct>;
  customer: {
    date_of_birth: string;
    type: string;
    organization_registration_id: string;
    gender: string;
  };
  html_snippet: string;
  merchant_reference1: string;
  merchant_reference2: string;
  started_at: string;
  completed_at: string;
  last_modified_at: string;
  external_payment_methods: Array<ExternalMethod>;
  external_checkouts: Array<ExternalMethod>;
  shipping_countries: Array<string>;
  shipping_options: Array<ShippingOption>;
  merchant_data: string;
  merchant_requested: {
    additional_checkbox: boolean;
    additional_checkboxes: Array<{
      id: string;
      checked: boolean;
    }>;
  };
  selected_shipping_option: ShippingOption;
  recurring: boolean;
  recurring_token: string;
  recurring_description: string;
  billing_countries: Array<string>;
  tags: string;
}
