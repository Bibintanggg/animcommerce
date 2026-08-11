import { Product } from "./product";
import { User } from "./user";

export interface Wishlist {
    id: number;
    user_id: number;
    product_id: number;
    user: User;
    product: Product;
    created_at: string;
}