import { Product } from "./product";

export interface CartProduct {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartProduct[];
}

export interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    thumbnail: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    category: string;
  };
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartQuantityRequest {
  product_id: number;
  quantity: number;
}