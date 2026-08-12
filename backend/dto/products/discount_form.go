package dto

type DiscountRequest struct {
	Code        string  `json:"code"`
	Type        string  `json:"type"`
	Value       float64 `json:"value"`
	MinPurchase float64 `json:"min_purchase"`
	MaxDiscount float64 `json:"max_discount"`
	UsageLimit  int     `json:"usage_limit"`
	StartAt     *string `json:"start_at"`
	EndAt       *string `json:"end_at"`
	IsActive    bool    `json:"is_active"`
}
