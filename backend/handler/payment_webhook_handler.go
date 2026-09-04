package handler

import (
	"animcommerce/backend/service"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type PaymentWebhookHandler struct {
	service service.PaymentWebhookService
}

func NewPaymentWebhookHandler(
	service service.PaymentWebhookService,
) *PaymentWebhookHandler {
	return &PaymentWebhookHandler{
		service: service,
	}
}

type midtransNotificationRequest struct {
	OrderID string `json:"order_id"`
}

func (h *PaymentWebhookHandler) MidtransNotification(
	c *gin.Context,
) {
	var request midtransNotificationRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Notifikasi tidak valid",
		})
		return
	}

	request.OrderID =
		strings.TrimSpace(request.OrderID)

	if request.OrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "order_id wajib diisi",
		})
		return
	}

	processed, err :=
		h.service.ProcessMidtransNotification(
			c.Request.Context(),
			request.OrderID,
		)

	if err != nil {
		log.Printf(
			"failed processing Midtrans webhook for order %s: %v",
			request.OrderID,
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal memproses notifikasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Notifikasi diterima",
		"processed": processed,
	})
}
