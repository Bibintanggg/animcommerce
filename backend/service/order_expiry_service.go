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

		// 3. Ambil item order dari database.
		// Urutan produk konsisten dengan penguncian pada checkout.
		var items []models.OrderItem

		if err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("order_id = ?", order.ID).
			Order("product_id ASC, id ASC").
			Find(&items).Error; err != nil {
			return fmt.Errorf("gagal membaca item order: %w", err)
		}

		if len(items) == 0 {
			return errors.New("order tidak memiliki item")
		}

		// OrderItem.Quantity bertipe int64,
		// sedangkan RestoreStock menerima int.
		maxQuantity := int64(^uint(0) >> 1)

		for _, item := range items {
			if item.ProductID <= 0 ||
				item.Quantity <= 0 ||
				item.Quantity > maxQuantity {
				return fmt.Errorf(
					"data order item %d tidak valid",
					item.ID,
				)
			}

			// RestoreStock juga membuat StockMovement berjenis "in".
			if err := s.productRepo.RestoreStock(
				tx,
				item.ProductID,
				int(item.Quantity),
			); err != nil {
				return fmt.Errorf(
					"gagal mengembalikan stok produk %d: %w",
					item.ProductID,
					err,
				)
			}
		}

		// 4. Tandai pembayaran sebagai expired.
		result := tx.
			Model(&models.Payment{}).
			Where(
				"id = ? AND payment_status = ?",
				payment.ID,
				enum.PaymentPending,
			).
			Update("payment_status", enum.PaymentExpired)

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected != 1 {
			return errors.New("gagal memperbarui status payment")
		}

		// 5. Batalkan order.
		result = tx.
			Model(&models.OrderProduct{}).
			Where(
				"id = ? AND status_order = ?",
				order.ID,
				enum.OrderPending,
			).
			Update("status_order", enum.OrderCancelled)

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected != 1 {
			return errors.New("gagal memperbarui status order")
		}

		// 6. Catat riwayat pembatalan.
		history := models.OrderStatusHistory{
			OrderID:        order.ID,
			StatusOrder:    enum.OrderCancelled,
			StatusShipment: order.StatusShipment,
			Title:          "Pembayaran kedaluwarsa",
			Description:    "Pesanan dibatalkan karena batas pembayaran terlewati. Stok dikembalikan.",
		}

		if err := tx.Create(&history).Error; err != nil {
			return fmt.Errorf("gagal menyimpan riwayat pembatalan: %w", err)
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
