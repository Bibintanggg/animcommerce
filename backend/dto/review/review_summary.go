package dto

type ReviewSummary struct {
	TotalReviews  int64   `json:"total_reviews"`
	AverageRating float64 `json:"average_rating"`

	Rating5 int64 `json:"rating_5"`
	Rating4 int64 `json:"rating_4"`
	Rating3 int64 `json:"rating_3"`
	Rating2 int64 `json:"rating_2"`
	Rating1 int64 `json:"rating_1"`
}
