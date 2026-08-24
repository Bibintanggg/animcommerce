export interface Payment {
    id: number;
    order_id: number;
    payment_method: string;
    amount: number;
    payment_status:
    | "pending"
    | "success"
    | "failed"
    | "expired";
    created_at: string;
    updated_at: string;
}