import api from "@/lib/api";
import { Product } from "@/types/product";

interface ProductResponse {
    data: Product[];
    message: string;
}

export const getProducts = async () => {
   const response = await api.get<ProductResponse>('/products')
   return response.data.data;
}

export const getNewArrivals = async () => {
    const response = await api.get<ProductResponse>("/products")
    return response.data.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 8)
}

export const getCategoriesItem = async () => {
    const response = await api.get<ProductResponse>("/products")
    return response.data.data.filter((product) => product.category === ProductCategory)
}