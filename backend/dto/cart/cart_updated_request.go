package dto

type CartUpdatedRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1,max=99"`
}
