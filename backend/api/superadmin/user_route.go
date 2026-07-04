package superadmin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type UserRoute struct {
	api         *gin.RouterGroup
	userHandler *handler.UserHandler
}

func NewUserRoute(api *gin.RouterGroup, userHandler *handler.UserHandler) *UserRoute {
	return &UserRoute{
		api:         api,
		userHandler: userHandler,
	}
}

func (r *UserRoute) Register() {
	r.api.GET("/users", r.userHandler.GetAllUser)
	r.api.POST("/users", r.userHandler.CreateUser)
	r.api.PUT("/users/:id", r.userHandler.UpdateUser)
}
