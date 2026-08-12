package dto

import "time"

type AdminReviewResponse struct {
	ID        int64     `json:"id"`
	ProductID int64     `json:"product_id"`
	Product   string    `json:"product"`
	Rating    int       `json:"rating"`
	CreatedAt time.Time `json:"created_at"`
}
