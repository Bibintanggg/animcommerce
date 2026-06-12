package public

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type PublicRoute struct {
	handler  *gin.RouterGroup
	login    *handler.LoginHandler
	register *handler.RegisterHandler
}

func NewPublicRoute(handler *gin.RouterGroup, login *handler.LoginHandler, register *handler.RegisterHandler) *PublicRoute {
	return &PublicRoute{
		handler:  handler,
		login:    login,
		register: register,
	}
}
