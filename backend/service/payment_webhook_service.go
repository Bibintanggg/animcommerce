package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PaymentWebhookService interface {
	ProcessMidtransNotification(
		ctx context.Context,
		orderNumber string,
	) (bool, error)
}

type paymentWebhookService struct {
	db          *gorm.DB
	gateway     PaymentGateway
	productRepo repository.ProductRepository
}

func NewPaymentWebhookService(
	db *gorm.DB,
	gateway PaymentGateway,
	productRepo repository.ProductRepository,
) PaymentWebhookService {
	return &paymentWebhookService{
		db:          db,
		gateway:     gateway,
		productRepo: productRepo,
	}
}

func parseMidtransAmount(value string) (int64, error) {
	value = strings.TrimSpace(value)

	whole, fraction, hasFraction :=
		strings.Cut(value, ".")

	if hasFraction &&
		strings.Trim(fraction, "0") != "" {
		return 0, errors.New(
			"nominal Midtrans memiliki pecahan tidak valid",
		)
	}

	amount, err := strconv.ParseInt(
		whole,
		10,
		64,
	)
	if err != nil || amount <= 0 {
		return 0, errors.New(
			"nominal Midtrans tidak valid",
		)
	}

	return amount, nil
}

func (s *paymentWebhookService) ProcessMidtransNotification(
	ctx context.Context,
	orderNumber string,
) (bool, error) {
	if ctx == nil {
		return false,
			errors.New("context tidak boleh nil")
	}

	if s.db == nil || s.gateway == nil || s.productRepo == nil {
		return false,
			errors.New(
				"payment webhook belum diinisialisasi",
			)
	}

	orderNumber = strings.TrimSpace(orderNumber)
	if orderNumber == "" {
		return false,
			errors.New("nomor order wajib diisi")
	}

	// Jangan mempercayai status dari request webhook.
	// Ambil status transaksi langsung dari Midtrans.
	status, err :=
		s.gateway.GetPaymentStatus(orderNumber)
	if err != nil {
		return false, err
	}

	if status.OrderNumber != orderNumber {
		return false,
			errors.New(
				"nomor order Midtrans tidak sesuai",
			)
	}

	transactionStatus := strings.ToLower(strings.TrimSpace(status.TransactionStatus))
	fraudStatus := strings.ToLower(strings.TrimSpace(status.FraudStatus))

	isCancellation := false

	var cancellationPaymentStatus enum.PaymentStatus
	var cancellationTitle string
	var cancellationDescription string

	switch transactionStatus {
	case "pending":
		return false, nil

	case "settlement":

	case "capture":
		if fraudStatus != "accept" {
			return false, nil
		}
		// Jangan return. Lanjut ke transaction di bawah.

	case "expire":
		isCancellation = true
		cancellationPaymentStatus = enum.PaymentExpired
		cancellationTitle = "Pembayaran kadaluwarsa"
		cancellationDescription = "Pesanan dibatalkan karena pembayaran kedaluwarsa. Stok dikembalikan."

	case "cancel":
		isCancellation = true
		cancellationPaymentStatus = enum.PaymentFailed
		cancellationTitle = "Pembayaran gagal"
		cancellationDescription = "Pesanan dibatalkan oleh sistem pembayaran. Stok dikembalikan."

	case "deny":
		isCancellation = true
		cancellationPaymentStatus = enum.PaymentFailed
		cancellationTitle = "Pembayaran ditolak"
		cancellationDescription = "Pembayaran ditolak oleh sistem pembayaran. Stok dikembalikan."

	default:
		return false, fmt.Errorf(
			"status transaksi Midtrans tidak dikenali: %s",
			transactionStatus,
		)
	}

	remoteAmount, err :=
		parseMidtransAmount(status.GrossAmount)
	if err != nil {
		return false, err
	}

	processed := false
	now := time.Now()

	err = s.db.
		WithContext(ctx).
		Transaction(func(tx *gorm.DB) error {
			var order models.OrderProduct

			if err := tx.
				Clauses(
					clause.Locking{
						Strength: "UPDATE",
					},
				).
				Where(
					"order_number = ?",
					orderNumber,
				).
				First(&order).Error; err != nil {
				return fmt.Errorf(
					"order tidak ditemukan: %w",
					err,
				)
			}

			var payment models.Payment

			if err := tx.
				Clauses(
					clause.Locking{
						Strength: "UPDATE",
					},
				).
				Where(
					"order_id = ?",
					order.ID,
				).
				First(&payment).Error; err != nil {
				return fmt.Errorf(
					"payment tidak ditemukan: %w",
					err,
				)
			}

			if payment.Provider != "midtrans" {
				return errors.New(
					"provider payment bukan Midtrans",
				)
			}

			if payment.Amount != remoteAmount {
				return errors.New(
					"nominal pembayaran tidak sesuai",
				)
			}

			if payment.ExternalReference != "" &&
				status.TransactionID !=
					payment.ExternalReference {
				return errors.New(
					"transaction ID tidak sesuai",
				)
			}

			if isCancellation {
				if order.StatusOrder == enum.OrderCancelled &&
					(payment.PaymentStatus == enum.PaymentExpired || payment.PaymentStatus == enum.PaymentFailed) {
					return nil
				}

				if order.StatusOrder != enum.OrderPending || payment.PaymentStatus != enum.PaymentPending {
					return errors.New("status order atau payment tidak dapat dibatalkan")
				}

				if payment.PaidAt != nil {
					return errors.New("payment yang sudah dibayar tidak dapat dibatalkan")
				}

				if err := CancelPendingOrderTx(
					tx, s.productRepo,
					&order,
					&payment,
					cancellationPaymentStatus,
					cancellationTitle,
					cancellationDescription,
				); err != nil {
					return nil
				}

				processed = true
				return nil
			}

			if order.StatusOrder == enum.OrderCancelled {
				return errors.New("order yang sudah dibatalkan tidak dapat dibayar")
			}

			if order.StatusOrder != enum.OrderPending {
				return errors.New("status order tidak dapat diproses sebagai pembayaran berhasil")
			}

			result := tx.
				Model(&models.Payment{}).
				Where(
					"id = ? AND payment_status = ?",
					payment.ID,
					enum.PaymentPending,
				).
				Updates(map[string]any{
					"payment_status": enum.PaymentSuccess,
					"paid_at":        &now,
				})

			if result.Error != nil {
				return result.Error
			}

			if result.RowsAffected != 1 {
				return errors.New(
					"gagal memperbarui payment",
				)
			}

			result = tx.Model(&models.OrderProduct{}).
				Where("id = ? AND status_order = ?", order.ID, enum.OrderPending).
				Update("status_order", enum.OrderProcessing)

			if result.Error != nil {
				return result.Error
			}

			if result.RowsAffected != 1 {
				return errors.New("gagal memperbarui order")
			}

			history := models.OrderStatusHistory{
				OrderID:        order.ID,
				StatusOrder:    enum.OrderProcessing,
				StatusShipment: order.StatusShipment,
				Title:          "Pembayaran berhasil",
				Description:    "Pembayaran telah diterima dan pesanan sedang diproses.",
			}

			if err := tx.Create(&history).Error; err != nil {
				return fmt.Errorf(
					"gagal membuat riwayat pembayaran: %w",
					err,
				)
			}

			processed = true
			return nil
		})

	if err != nil {
		return false, err
	}

	return processed, nil
}
