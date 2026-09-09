import api from "@/lib/api";
import {
    ShippingDestination,
    ShippingOption,
} from "@/types/shipping";

interface ApiDataResponse<T> {
    data: T;
}

export interface CalculateShippingPayload {
    destination_id: number;
    weight: number;
}

export async function searchShippingDestinations(search: string): Promise<ShippingDestination[]> {
    const response = await api.get<ApiDataResponse<ShippingDestination[]>>("/shipping/destinations", {
        params: { search },
    });
    return response.data.data;
}

export async function calculateShippingCosts(payload: CalculateShippingPayload): Promise<ShippingOption[]> {
    const response = await api.post<ApiDataResponse<ShippingOption[]>>("/shipping/costs", payload);
    return response.data.data;
}