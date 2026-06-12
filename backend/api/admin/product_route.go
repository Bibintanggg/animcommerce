package admin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type ProductRoute struct {
	api            *gin.RouterGroup
	productHandler *handler.ProductHandler
}

func NewProductRoute(api *gin.RouterGroup, productHandler *handler.ProductHandler) *ProductRoute {
	return &ProductRoute{
		api:            api,
		productHandler: productHandler,
	}
}

func (r *ProductRoute) Register() {
	r.api.POST("/products", r.productHandler.CreateProduct)
	r.api.PUT("/products/:id", r.productHandler.UpdateProduct)
	r.api.DELETE("/products/:id", r.productHandler.DeleteProduct)
}
