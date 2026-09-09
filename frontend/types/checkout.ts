export type PaymentMethod =
  | "qris"
  | "bca_va";

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "expired";

export interface PaymentInstruction {
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  qr_string?: string;
  qr_url?: string;
  va_number?: string;
  expires_at?: string;
}

export interface CheckoutAddress {
  receiver_name: string;
  phone_number: string;
  address_line: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postal_code: string;
  destination_id: number;
}

export interface CheckoutShipping {
  courier_code: string;
  service: string;
}

export interface CheckoutPayload {
  cart_item_ids: number[];
  address: CheckoutAddress;
  shipping: CheckoutShipping;
  payment_method: PaymentMethod;
}

export interface CheckoutProductPayload {
  quantity: number;
  address: CheckoutAddress;
  shipping: CheckoutShipping;
  payment_method: PaymentMethod;
}

export interface BuyNowPayload
  extends CheckoutProductPayload {
  notes?: string;
}

export interface CheckoutResult {
  order_id: number;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  payment_method: PaymentMethod;

  payment: PaymentInstruction;
}

export interface CheckoutResponse {
  message: string;
  data: CheckoutResult;
}

export type BuyNowAddress = CheckoutAddress;
export type BuyNowResult = CheckoutResult;
export type BuyNowResponse = CheckoutResponse;