package order

type CheckoutAddressRequest struct {
	ReceiverName string `json:"receiver_name" binding:"required,min=2,max=100"`
	PhoneNumber  string `json:"phone_number" binding:"required,min=10,max=20"`
	AddressLine  string `json:"address_line" binding:"required,min=10,max=500"`
	Province     string `json:"province" binding:"required,max=100"`
	City         string `json:"city" binding:"required,max=100"`
	District     string `json:"district" binding:"required,max=100"`
	PostalCode   string `json:"postal_code" binding:"required,len=5"`
}

type CheckoutRequest struct {
	CartItemIDs   []int64                `json:"cart_item_ids" binding:"required,min=1,dive,gt=0"`
	Address       CheckoutAddressRequest `json:"address" binding:"required"`
	PaymentMethod string                 `json:"payment_method" binding:"required,oneof=cod"`
}

type CheckoutResponse struct {
	OrderID       int64  `json:"order_id"`
	OrderNumber   string `json:"order_number"`
	Subtotal      int64  `json:"subtotal"`
	ShippingCost  int64  `json:"shipping_cost"`
	GrandTotal    int64  `json:"grand_total"`
	PaymentMethod string `json:"payment_method"`
}
