package dto

type UpdateProductRequest struct {
	Title       string `form:"title" binding:"required"`
	Thumbnail   string `form:"thumbnail"`
	Description string `form:"description"`
	Price       int    `form:"price" binding:"required"`
	Stock       int    `form:"stock" binding:"required"`
	IsActive    string `form:"is_active"`
	Category    string `form:"category"`
}
