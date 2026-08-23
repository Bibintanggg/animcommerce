export interface CheckoutAddress {
  receiver_name: string;
  phone_number: string;
  address_line: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
}

export interface CheckoutPayload {
  cart_item_ids: number[];
  address: CheckoutAddress;
  payment_method: "cod";
}

export interface CheckoutResult {
  order_id: number;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  payment_method: "cod";
}

export interface CheckoutResponse {
  message: string;
  data: CheckoutResult;
}

export interface BuyNowAddress {
  receiver_name: string;
  phone_number: string;
  address_line: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
}

export interface BuyNowPayload {
  quantity: number;
  address: BuyNowAddress;
  payment_method: "cod";
  notes?: string;
}

export interface BuyNowResult {
  order_id: number;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  grand_total: number;
  payment_method: "cod";
}

export interface BuyNowResponse {
  message: string;
  data: BuyNowResult;
}

export interface CheckoutProductPayload {
  quantity: number;
  address: {
    receiver_name: string;
    phone_number: string;
    address_line: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
  };
  payment_method: "cod";
}