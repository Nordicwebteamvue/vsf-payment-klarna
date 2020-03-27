type GenericObject = { [key: string]: any }

export interface KlarnaProduct {
  type?: string;
  reference?: string; // sku
  name: string;
  quantity: number;
  quantity_unit?: string;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
  total_discount_amount?: number;
  total_tax_amount: number;
  merchant_data?: string;
  product_url?: string;
  image_url?: string;
  product_identifiers?: GenericObject;
  shipping_attributes?: GenericObject;
}
