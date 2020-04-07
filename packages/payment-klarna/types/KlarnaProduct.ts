type GenericObject = { [key: string]: any }

export interface KlarnaProduct {
  type?: string;
  reference?: string; // sku
  name: string;
  quantity: number;
  quantityUnit?: string;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
  totalDiscountAmount?: number;
  totalTaxAmount: number;
  merchantData?: string;
  productUrl?: string;
  imageUrl?: string;
  productIdentifiers?: GenericObject;
  shippingAttributes?: GenericObject;
}
