package customer

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type CartRoute struct {
	api         *gin.RouterGroup
	cartHandler *handler.CartHandler
}

func NewCartRoute(api *gin.RouterGroup, cartHandler *handler.CartHandler) *CartRoute {
	return &CartRoute{
		api:         api,
		cartHandler: cartHandler,
	}
}

func (r *CartRoute) Register() {
	r.api.GET("/cart", r.cartHandler.GetCart)
	r.api.POST("/cart", r.cartHandler.AddToCart)
	r.api.PUT("/cart/:id", r.cartHandler.UpdateQuantity)
	r.api.DELETE("/cart/:id", r.cartHandler.RemoveItem)
}
