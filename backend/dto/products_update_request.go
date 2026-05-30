package dto

type UpdateProductRequest struct {
	Title       string `json:"title" binding:"required"`
	Thumbnail   string `json:"thumbnail" binding:"required"`
	Description string `json:"description"`
	Price       int    `json:"price" binding:"required"`
	Stock       int    `json:"stock" binding:"required"`
	IsActive    string `json:"is_active"`
	Category    string `json:"category"`
}
