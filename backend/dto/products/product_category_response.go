package dto

type ProductCategoryResponse struct {
	Name  string `json:"name"`
	Slug  string `json:"slug"`
	Count int    `json:"count"`
	Image string `json:"image"`
}
