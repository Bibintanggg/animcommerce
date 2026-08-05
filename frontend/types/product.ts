import { ProductCategory } from "@/enums/product-category";
import { ProductStatus } from "@/enums/product-status";

export interface Product {
    id: number;
    title: string;
    thumbnail: string;
    slug: string
    description: string;
    price: number;
    stock: number
    is_active: ProductStatus;
    created_at: string;
    updated_at: string;
    category: ProductCategory
}

export interface ProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DeleteProductResponse {
    message: string
}