import api from "@/lib/api";
import { CreateReviewRequest, Review, ReviewFilter, ReviewsResponse, ReviewSummary } from "@/types/product-review";

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

export const updateReview = async (reviewID: number, data: CreateReviewRequest): Promise<Review> => {
    const response = await api.put<{data: Review}>(`/reviews/${reviewID}`, data)
    return response.data.data
}



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