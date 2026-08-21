import api from "@/lib/api";
import { Wishlist } from "@/types/product-wishlist";

interface WishlistResponse {
    data: Wishlist[]
    message: string
}

interface WishlistItemResponse {
    data: Wishlist
    message: string
}

interface WishlistMessageResponse {
    message: string
}

export const getWishlist = async (): Promise<Wishlist[]> => {
    const response = await api.get<WishlistResponse>("/wishlists")
    return response.data.data
}

export const addWishlistItem = async (productId: number) => {
    const resposne = await api.post<WishlistItemResponse>(`/wishlists/${productId}`)
    return resposne.data.data
}

export const removeWishlist = async (productId: number) => {
    const response = await api.delete<WishlistMessageResponse>(`/wishlists/${productId}`)
    return response.data.message
}

