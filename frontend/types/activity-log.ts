export type ActivityType = "checkout" | "register" | "login" | "order_shipped" | "payment_failed";

export interface ActivityLog {
    id: number;
    user: string;
    type: ActivityType;
    detail: string;
    time: string;
    amount?: string;
}
