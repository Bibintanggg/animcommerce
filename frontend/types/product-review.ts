import { User } from "./user";

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    user: User;
    created_at: string;
    updated_at: string;
}