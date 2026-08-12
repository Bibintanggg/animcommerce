package dto

type UpdateProductRequest struct {
	Title       string `form:"title" binding:"required"`
	Description string `form:"description"`
	Price       int    `form:"price" binding:"required"`
	Stock       int    `form:"stock" binding:"required"`
	IsActive    string `form:"is_active"`
	Category    string `form:"category"`
	IsFeatured  bool   `form:"is_featured"`
	Discount    string `form:"discount"`
	Sizes        string `form:"sizes"`
}
