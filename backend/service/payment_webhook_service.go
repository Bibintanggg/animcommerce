package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
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
	db      *gorm.DB
	gateway PaymentGateway
}

func NewPaymentWebhookService(
	db *gorm.DB,
	gateway PaymentGateway,
) PaymentWebhookService {
	return &paymentWebhookService{
		db:      db,
		gateway: gateway,
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

	if s.db == nil || s.gateway == nil {
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

	isSuccessful :=
		status.TransactionStatus == "settlement" ||
			(status.TransactionStatus == "capture" &&
				status.FraudStatus == "accept")

	// Untuk fase pertama, status selain berhasil
	// belum mengubah database.
	if !isSuccessful {
		return false, nil
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

			// Webhook Midtrans bisa dikirim berulang.
			// Kalau sudah sukses, jangan proses dua kali.
			if payment.PaymentStatus ==
				enum.PaymentSuccess {
				return nil
			}

			if payment.PaymentStatus !=
				enum.PaymentPending {
				return errors.New(
					"status payment tidak dapat diubah",
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

			if order.StatusOrder ==
				enum.OrderPending {
				result = tx.
					Model(&models.OrderProduct{}).
					Where(
						"id = ? AND status_order = ?",
						order.ID,
						enum.OrderPending,
					).
					Update(
						"status_order",
						enum.OrderProcessing,
					)

				if result.Error != nil {
					return result.Error
				}

				if result.RowsAffected != 1 {
					return errors.New(
						"gagal memperbarui order",
					)
				}
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
