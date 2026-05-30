package dto

type ProductlistResponse struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Thumbnail   string `json:"thumbnail"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Price       int    `json:"price"`
	Stock       int    `json:"stock"`
	Category    string `json:"category"`
}
