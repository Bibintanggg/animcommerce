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