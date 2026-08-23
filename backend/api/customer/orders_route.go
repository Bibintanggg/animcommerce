package customer

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type OrdersRoute struct {
	api          *gin.RouterGroup
	orderHandler *handler.OrderHandler
}

func NewOrdersRoute(api *gin.RouterGroup, orderHandler *handler.OrderHandler) *OrdersRoute {
	return &OrdersRoute{
		api:          api,
		orderHandler: orderHandler,
	}
}

func (r *OrdersRoute) Register() {
	r.api.POST("/orders/checkout", r.orderHandler.CheckoutCart)
	r.api.POST("/orders/checkout/product/:slug", r.orderHandler.CheckoutProduct)
	r.api.GET("/orders", r.orderHandler.GetMyOrders)
	r.api.GET("/orders/:id", r.orderHandler.GetOrderDetail)
	r.api.GET("/orders/:id/invoice", r.orderHandler.GetMyInvoice)
}
