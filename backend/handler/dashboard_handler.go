package handler

import (
	"animcommerce/backend/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service service.UserService
}

func NewDashboardHandler(service service.UserService) *DashboardHandler {
	return &DashboardHandler{
		service: service,
	}
}

func (h *DashboardHandler) GetRecentRegisteredUsers(c *gin.Context) {
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "5"))
	if err != nil || limit < 1 {
		limit = 5
	}

	activities, err := h.service.GetRecentRegisteredUsers(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get recent registered users",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": activities,
	})
}
