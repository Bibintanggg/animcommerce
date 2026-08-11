import { ProductCategory } from "@/enums/product-category";
import { ProductStatus } from "@/enums/product-status";
import { Discount } from "./product-discount";
import { Review } from "./product-review";
import { ProductSize } from "./product-type";
import { Wishlist } from "./product-wishlist";

export interface Product {
    id: number;
    user_id: number;
    title: string;
    thumbnail: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    is_featured: boolean;
    is_active: ProductStatus;
    category: ProductCategory;
    sold: number;
    reviews: Review[];
    size: ProductSize[];
    wishlists: Wishlist[];
    discounts: Discount[];
    created_at: string;
    updated_at: string;
}

export interface getProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DeleteProductResponse {
    message: string
}

export interface CategoryItem {
    category: ProductCategory;
    count: number;
}

export interface StockMovementChart {
    date: string;
    stock: number;
    value: number;
}