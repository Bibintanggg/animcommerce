export interface Discount {
    id: number;
    code: string;
    type: string;
    value: number;
    min_purchase: number;
    max_discount: number;
    usage_limit: number;
    used_count: number;
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DiscountFormData {
    code: string;
    type: string;
    value: number;
    min_purchase: number;
    max_discount: number;
    usage_limit: number;
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
}