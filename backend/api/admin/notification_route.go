package admin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type NotificationRoute struct {
	api                 *gin.RouterGroup
	notificationHandler *handler.NotificationHandler
	fcmDeviceHandler    *handler.FCMDeviceHandler
}

func NewNotificationRoute(
	api *gin.RouterGroup,
	notificationHandler *handler.NotificationHandler,
	fcmDeviceHandler *handler.FCMDeviceHandler,
) *NotificationRoute {
	return &NotificationRoute{
		api:                 api,
		notificationHandler: notificationHandler,
		fcmDeviceHandler:    fcmDeviceHandler,
	}
}

func (r *NotificationRoute) Register() {
	r.api.GET(
		"/notifications",
		r.notificationHandler.GetNotifications,
	)

	r.api.GET(
		"/notifications/stream",
		r.notificationHandler.Stream,
	)

	r.api.PATCH(
		"/notifications/read-all",
		r.notificationHandler.MarkAllAsRead,
	)

	r.api.PATCH(
		"/notifications/:id/read",
		r.notificationHandler.MarkAsRead,
	)

	r.api.POST(
		"/notifications/devices",
		r.fcmDeviceHandler.Register,
	)
}
