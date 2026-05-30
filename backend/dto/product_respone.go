package dto

type ProductResponse struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Price       int    `json:"price"`
	SellerName  string `json:"seller_name"`
	SellerEmail string `json:"seller_email"`
	Stock       int    `json:"stock"`
}
