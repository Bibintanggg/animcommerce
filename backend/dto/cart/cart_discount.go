package dto

type ApplyDiscountRequest struct {
	Code     string `json:"code"`
	Subtotal int    `json:"subtotal"`
}

type ApplyDiscountResponse struct {
	Code     string `json:"code"`
	Discount int    `json:"discount"`
}
