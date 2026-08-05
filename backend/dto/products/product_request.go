package dto

type CreateProductRequest struct {
	Title       string  `form:"title" binding:"required"`
	Slug        string  `form:"slug" binding:"required"`
	Description string  `form:"description"`
	Price       float64 `form:"price" binding:"required"`
	Stock       int     `form:"stock" binding:"required"`
	IsActive    string  `form:"isActive"`
	Category    string  `form:"category"`
}
