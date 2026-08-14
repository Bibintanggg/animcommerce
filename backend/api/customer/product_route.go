package customer

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
	r.api.GET("/products", r.productHandler.GetProducts)
	r.api.GET("/product-details/:slug", r.productHandler.GetProductDetails)
	// r.api.GET("/products?=category${}")
}
