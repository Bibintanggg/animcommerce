package admin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type OrderRoute struct {
	api          *gin.RouterGroup
	orderHandler *handler.OrderHandler
}

func NewOrderRoute(
	api *gin.RouterGroup,
	orderHandler *handler.OrderHandler,
) *OrderRoute {
	return &OrderRoute{
		api:          api,
		orderHandler: orderHandler,
	}
}

func (r *OrderRoute) Register() {

	r.api.PATCH("/orders/:id/status", r.orderHandler.UpdateOrderStatus)
	r.api.GET("/orders", r.orderHandler.GetAllOrders)
	r.api.GET("/orders/:id", r.orderHandler.GetAdminOrderDetail)
	r.api.GET("/orders/:id/invoice", r.orderHandler.GetAdminInvoice)

	// r.api.PATCH("/orders/:id/shipment", r.orderHandler.UpdateShipmentStatus)
}
