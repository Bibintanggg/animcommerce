package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (s *orderService) ExpireOrder(ctx context.Context, orderID int64, now time.Time) (bool, error) {
	if orderID <= 0 || now.IsZero() {
		return false, errors.New("Parameter expiry tidak valid")
	}

	expired := false

	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Kunci order agar dua proses expiry tidak berjalan
		// bersamaan untuk order yang sama.
		var order models.OrderProduct
		if err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&order, orderID).Error; err != nil {
			return fmt.Errorf("gagal membaca order: %w", err)
		}

		if order.StatusOrder != enum.OrderPending ||
			order.StatusShipment != enum.ShipmentAwaitingPickup ||
			order.ShippedAt != nil ||
			order.CompletedAt != nil {
			return nil
		}

		var payments []models.Payment
		if err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("order_id = ?", order.ID).
			Order("id ASC").
			Find(&payments).Error; err != nil {
			return fmt.Errorf("gagal membaca payment: %w", err)
		}

		if len(payments) != 1 {
			return errors.New("order harus memiliki tepat satu payment")
		}

		payment := payments[0]

		if payment.Provider != "dummy" ||
			payment.PaymentStatus != enum.PaymentPending ||
			payment.PaidAt != nil ||
			payment.ExpiresAt == nil ||
			payment.ExpiresAt.After(now) {
			return nil
		}

		if err := CancelPendingOrderTx(
			tx,
			s.productRepo,
			&order,
			&payment,
			enum.PaymentExpired,
			"Pembayaran kedaluwarsa",
			"Pesanan dibatalkan karena batas pembayaran terlewati. Stok dikembalikan.",
		); err != nil {
			return err
		}

		expired = true
		return nil
	})

	// Termasuk jika commit gagal: jangan mengembalikan true.
	if err != nil {
		return false, err
	}

	return expired, nil
}
