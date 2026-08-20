import api from "@/lib/api";
import { AddToCartRequest, Cart, CartItem, CartProduct, UpdateCartQuantityRequest } from "@/types/cart-product";
import { Product } from "@/types/product";

interface ProductResponse {
    data: Product[];
    message: string;
}

export const getCart = async (): Promise<CartItem[]> => {
    const response = await api.get("/cart");

    return response.data.data.map((item: any) => ({
        id: item.ID,
        quantity: item.Quantity,
        product: {
            id: item.Product.id,
            title: item.Product.title,
            thumbnail: item.Product.thumbnail,
            slug: item.Product.slug,
            description: item.Product.description,
            price: item.Product.price,
            stock: item.Product.stock,
            category: item.Product.category,
        },
    }));
};

export const addToCart = async (payload: AddToCartRequest) => {
    const response = await api.post("/cart", payload)
    return response.data.data
}

export const updateCartQuantity = async (payload: UpdateCartQuantityRequest) => {
	const response = await api.put(`/cart/${payload.product_id}`, {
		quantity: payload.quantity,
	})
    return response.data
}

export const removeCartItem = async (productID: number) => {
    const response = await api.delete(`/cart/${productID}`)
    return response.data
}

export const recommendProduct = async (): Promise<ProductResponse> => {
    const response = await api.get("/products")
    return response.data.data
}
