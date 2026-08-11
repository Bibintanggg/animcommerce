import api from "@/lib/api"
import { OrderListResponse, OrderProduct } from "@/types/order"
import { Product } from "@/types/product";

interface OrderResponse {
    data: OrderProduct[]
    message: string
}
export const getOrders = async (
    page: number = 1,
    limit: number = 10,
    search?: string
): Promise<OrderListResponse> => {
    const response = await api.get<OrderListResponse>("/admin/orders", {
        params: {
            page,
            limit,
            ...(search ? { search } : {}),
        },
    });

    return response.data;
};