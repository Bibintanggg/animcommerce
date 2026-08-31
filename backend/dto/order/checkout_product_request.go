package order

type CheckoutProductRequest struct {
	Quantity      int                    `json:"quantity" binding:"required,min=1"`
	Address       CheckoutAddressRequest `json:"address" binding:"required"`
	PaymentMethod string                 `json:"payment_method" binding:"required,oneof=qris bca_va"`
}
