import { User } from "./user";

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    user: User;
    created_at: string;
    updated_at: string;
}

export interface ReviewUser {
    id: number;
    name: string;
}

export interface ReviewProduct {
    id: number;
    title: string;
}

export interface AdminReview {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    product: ReviewProduct;
    user: ReviewUser;
    created_at: string;
    updated_at: string;
}

export interface ReviewSummary {
    total_reviews: number;
    average_rating: number;
    rating_5: number;
    rating_4: number;
    rating_3: number;
    rating_2: number;
    rating_1: number;
}

export interface ReviewFilter {
    page?: number;
    limit?: number;
    search?: string;
}

export interface ReviewsResponse {
    data: AdminReview[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface CreateReviewRequest {
    rating: number;
    comment: string;
}