export interface Notification {
    id: number;
    user_id: number;
    order_id?: number;
    type: "order.created" | string;
    title: string;
    message: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

export interface NotificationListResponse {
    data: Notification[];
    total: number;
    unread: number;
    page: number;
    limit: number;
}