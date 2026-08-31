export type PaymentMethod =
    | "qris"
    | "bca_va";

export type PaymentStatus =
    | "pending"
    | "success"
    | "failed"
    | "expired";

export interface Payment {
    id: number;
    order_id: number;

    payment_method: PaymentMethod;
    payment_status: PaymentStatus;

    provider: string;
    external_reference: string;

    qr_string?: string;
    va_number?: string;

    amount: number;
    expires_at?: string | null;
    paid_at?: string | null;

    created_at: string;
    updated_at: string;
}