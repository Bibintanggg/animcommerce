package dto

type CreateProductRequest struct {
	Title       string `json:"title" binding:"required"`
	Thumbnail   string `json:"thumbnail" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
	Price       int    `json:"price" binding:"required"`
	Stock       int    `json:"stock"`
}
