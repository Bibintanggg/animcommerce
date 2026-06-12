package public

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type PublicRoute struct {
	handler *gin.RouterGroup
	api     *handler.LoginHandler
}

func NewPublicRoute(handler *gin.RouterGroup, api *handler.LoginHandler) *PublicRoute {
	return &PublicRoute{
		handler: handler,
		api:     api,
	}
}
