import api from "@/lib/api";
import { AddToCartRequest, Cart, CartItem, CartProduct, UpdateCartQuantityRequest } from "@/types/cart-product";
import { Product } from "@/types/product";

interface ProductResponse {
    data: Product[];
    message: string;
}

interface CartApiItem {
    ID: number;
    CartID: number;
    ProductID: number;
    Product: {
        id: number;
        title: string;
        thumbnail: string;
        slug: string;
        price: number;
        stock: number;
        weight: number;
    };
    Quantity: number;
}

export async function getCart() {
    const response = await api.get<{
        data: CartApiItem[];
        message: string;
    }>("/cart");

    return response.data.data.map((item) => ({
        id: item.ID,
        cart_id: item.CartID,
        product_id: item.ProductID,
        quantity: item.Quantity,

        product: {
            ...item.Product,
            weight: Number(item.Product.weight),
        },
    }));
}

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
