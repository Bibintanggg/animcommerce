package handler

import (
	"animcommerce/backend/realtime"
	"animcommerce/backend/service"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	service service.NotificationService
	hub     *realtime.NotificationHub
}

func NewNotificationHandler(
	service service.NotificationService,
	hub *realtime.NotificationHub,
) *NotificationHandler {
	return &NotificationHandler{
		service: service,
		hub:     hub,
	}
}

func (h *NotificationHandler) Stream(
	c *gin.Context,
) {
	// Pastikan middleware menyimpan claims.UserID sebagai int64.
	userID := c.GetInt64("user_id")

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	client := h.hub.Subscribe(userID)
	defer h.hub.Unsubscribe(userID, client)

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	heartbeat := time.NewTicker(25 * time.Second)
	defer heartbeat.Stop()

	c.Stream(func(w io.Writer) bool {
		select {
		case event, ok := <-client:
			if !ok {
				return false
			}

			c.SSEvent(event.Type, event)
			return true

		case currentTime := <-heartbeat.C:
			c.SSEvent("ping", gin.H{
				"time": currentTime,
			})
			return true

		case <-c.Request.Context().Done():
			return false
		}
	})
}

func (h *NotificationHandler) GetNotifications(
	c *gin.Context,
) {
	userID := c.GetInt64("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 20
	}

	result, err := h.service.GetMyNotifications(
		userID,
		page,
		limit,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal mengambil notifikasi",
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *NotificationHandler) MarkAsRead(
	c *gin.Context,
) {
	userID := c.GetInt64("user_id")

	notificationID, err :=
		strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "ID notifikasi tidak valid",
		})
		return
	}

	if err := h.service.MarkAsRead(
		notificationID,
		userID,
	); err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Notifikasi tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notifikasi sudah dibaca",
	})
}

func (h *NotificationHandler) MarkAllAsRead(
	c *gin.Context,
) {
	userID := c.GetInt64("user_id")

	if err := h.service.MarkAllAsRead(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal memperbarui notifikasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Semua notifikasi sudah dibaca",
	})
}
