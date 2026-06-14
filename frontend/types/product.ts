export interface Product {
    id: number;
    title: string;
    thumbnail: string;
    slug: string
    description: string;
    price: number;
    stock: number
    isActive: ProductStatus;
    createdAt: string;
    updatedAt: string;
    category: ProductCategory
}