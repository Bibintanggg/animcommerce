import { ProductCategory } from "@/enums/product-category";

export interface Product {
    id: number;
    title: string;
    thumbnail: string;
    slug: string
    description: string;
    price: number;
    stock: number
    is_active: ProductStatus;
    createdAt: string;
    updatedAt: string;
    category: ProductCategory
}