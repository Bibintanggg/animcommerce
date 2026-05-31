package dto

type CartUpdatedRequest struct {
	Quantity int `json:"quantity" binding:"required"`
}
