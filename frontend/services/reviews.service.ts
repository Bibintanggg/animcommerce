import api from "@/lib/api";

export interface ReviewUser {
    id: number;
    name: string;
}

export interface ReviewProduct {
    id: number;
    title: string;
}

export interface Review {
    id: number;
    product_id: number;
    user_id: number;
    rating: number;
    comment: string;
    user: ReviewUser;
    created_at: string;
    updated_at: string;
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

export const getProductReviews = async (
    productId: number
): Promise<Review[]> => {
    const response = await api.get<{ data: Review[] }>(
        `/products/${productId}/reviews`
    );

    return response.data.data;
};

export const createReview = async (
    productId: number,
    data: CreateReviewRequest
): Promise<Review> => {
    const response = await api.post<{ data: Review }>(
        `/products/${productId}/reviews`,
        data
    );

    return response.data.data;
};

export const getReview = async (
    reviewId: number
): Promise<Review> => {
    const response = await api.get<{ data: Review }>(
        `/reviews/${reviewId}`
    );

    return response.data.data;
};



export const getReviews = async (
    filter: ReviewFilter = {}
): Promise<ReviewsResponse> => {
    const response = await api.get<ReviewsResponse>(
        "/admin/reviews",
        {
            params: {
                page: filter.page ?? 1,
                limit: filter.limit ?? 10,
                ...(filter.search
                    ? { search: filter.search }
                    : {}),
            },
        }
    );

    return response.data;
};

export const getReviewSummary = async (): Promise<ReviewSummary> => {
    const response = await api.get<{ data: ReviewSummary }>(
        "/admin/reviews/summary"
    );

    return response.data.data;
};