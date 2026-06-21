export interface UserAddress {
  id: number;
  user_id: number;
  receiver_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
