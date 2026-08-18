package dto

type CartItemResponse struct {
	ID       int64               `json:"id"`
	Quantity int                 `json:"quantity"`
	Product  ProductListResponse `json:"product"`
}

type ProductListResponse struct {
	ID          int64             `json:"id"`
	Title       string            `json:"title"`
	Thumbnail   string            `json:"thumbnail"`
	Slug        string            `json:"slug"`
	Description string            `json:"description"`
	Price       int               `json:"price"`
	Stock       int               `json:"stock"`
	Category    string            `json:"category"`
	Discount    *DiscountResponse `json:"discount"`
}

type DiscountResponse struct {
	Code        string `json:"code"`
	Type        string `json:"type"`
	Value       int    `json:"value"`
	MinPurchase int    `json:"min_purchase"`
	MaxDiscount int    `json:"max_discount"`
	IsActive    bool   `json:"is_active"`
}
