import { StatusOrder } from "@/enums/order-status";
import { User } from "./user";
import { UserAddress } from "./user_address";
import { ShipmentStatus } from "@/enums/shipment-status";
import { Product } from "./product";

export interface OrderProduct {
    id: number;
    order_number: string;
    invoice_url: string | null;
    user_id: number;
    user?: User;
    address_id: number;
    user_address?: UserAddress;
    order_item: OrderItem[];
    total_price: number;
    shipping_cost: number;
    status_order: StatusOrder;
    status_shipment: ShipmentStatus;
    tracking_number: string | null;
    courier: string | null;
    shipped_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product?: Product;
    quantity: number;
    price: number;
    created_at: string;
    updated_at: string;
}

export interface OrderListResponse {
    message: string;
    data: OrderProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}