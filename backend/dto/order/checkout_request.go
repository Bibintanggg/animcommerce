package order

type CheckoutRequest struct {
	AddressID int64 `json:"address_id" binding:"required"`
}
