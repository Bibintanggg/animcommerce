package superadmin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type DashboardRoute struct {
	api              *gin.RouterGroup
	dashboardHandler *handler.DashboardHandler
}

func NewDashboardRoute(api *gin.RouterGroup, dashboardHandler *handler.DashboardHandler) *DashboardRoute {
	return &DashboardRoute{
		api:              api,
		dashboardHandler: dashboardHandler,
	}
}

func (r *DashboardRoute) Register() {
	r.api.GET("/dashboard", r.dashboardHandler.GetRecentRegisteredUsers)
}
