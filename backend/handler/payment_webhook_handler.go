package handler

import (
	"animcommerce/backend/service"
	"crypto/sha512"
	"crypto/subtle"
	"encoding/hex"
	"log"
	"net/http"
	"os"
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
	OrderID           string `json:"order_id"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	TransactionStatus string `json:"transaction_status"`
	FraudStatus       string `json:"fraud_status"`
}

func verifyMidtransSignature(request midtransNotificationRequest, serverKey string) bool {
	rawSignature := request.OrderID + request.StatusCode + request.GrossAmount + serverKey

	hash := sha512.Sum512([]byte(rawSignature))

	expectedSignature := hex.EncodeToString(hash[:])

	receivedSignature := strings.ToLower(strings.TrimSpace(request.SignatureKey))

	return subtle.ConstantTimeCompare([]byte(expectedSignature), []byte(receivedSignature)) == 1
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

	request.OrderID = strings.TrimSpace(request.OrderID)
	request.StatusCode = strings.TrimSpace(request.StatusCode)
	request.GrossAmount = strings.TrimSpace(request.GrossAmount)
	request.SignatureKey = strings.TrimSpace(request.SignatureKey)

	if request.OrderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "order_id wajib diisi",
		})
		return
	}

	if request.StatusCode == "" ||
		request.GrossAmount == "" ||
		request.SignatureKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data signature tidak lengkap",
		})
		return
	}

	serverKey := strings.TrimSpace(
		os.Getenv("MIDTRANS_SERVER_KEY"),
	)

	if serverKey == "" {
		log.Print(
			"MIDTRANS_SERVER_KEY belum dikonfigurasi",
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Konfigurasi pembayaran bermasalah",
		})
		return
	}

	if !verifyMidtransSignature(request, serverKey) {
		log.Printf("invalid Midtrans signature for order %s", request.OrderID)

		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Signature notifikasi tidak valid",
		})
		return
	}

	if strings.HasPrefix(request.OrderID, "payment_notif_test") {
		log.Printf("Midtrans notification URL Test diterima: %s", request.OrderID)

		c.JSON(http.StatusOK, gin.H{
			"message":   "Midtrans notification URL test berhasil",
			"processed": false,
		})
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
