import { StatusOrder } from "@/enums/order-status";
import api from "@/lib/api"
import { BuyNowPayload, BuyNowResponse, CheckoutPayload, CheckoutProductPayload, CheckoutResponse } from "@/types/checkout";
import { OrderListResponse, OrderProduct } from "@/types/order"
import { Product } from "@/types/product";

interface OrderResponse {
    data: OrderProduct[]
    message: string
}

interface UpdateOrderStatusResponse {
    message: string
}

interface UserOrdersResponse {
    data: OrderProduct[],
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

export const checkoutCart = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutResponse>("/orders/checkout", payload)
    return response.data
}

export async function checkoutProduct(slug: string, payload: CheckoutProductPayload): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>(`/orders/checkout/product/${slug}`, payload);

    return response.data;
}

export const updateOrderStatus = async (orderID: number | string, status: StatusOrder): Promise<UpdateOrderStatusResponse> => {
    const response = await api.patch(`/admin/orders/${orderID}/status`, {
        status_order: status
    })
    return response.data
}

export const getOrderUser = async (): Promise<UserOrdersResponse> => {
        const response = await api.get<UserOrdersResponse>("/orders");
        return response.data;
};


export const downloadOrderInvoice = async (orderID: number) => {
    const response = await api.get(`/orders/${orderID}/invoice`, {
        responseType: "blob"
    })
    return response.data
}