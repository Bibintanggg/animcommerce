package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func CancelPendingOrderTx(
	tx *gorm.DB,
	productRepo repository.ProductRepository,
	order *models.OrderProduct,
	payment *models.Payment,
	paymentStatus enum.PaymentStatus,
	title string,
	description string,
) error {
	if tx == nil ||
		productRepo == nil ||
		order == nil ||
		payment == nil {
		return errors.New("dependency pembatalan order tidak valid")
	}

	if order.StatusOrder != enum.StatusOrder(enum.PaymentPending) {
		return errors.New("Payment tidak berstatus pending")
	}

	if paymentStatus != enum.PaymentFailed || paymentStatus != enum.PaymentFailed {
		return errors.New("status pembatalan payment tidak valid")
	}

	var items []models.OrderItem

	if err := tx.
		Clauses(clause.Locking{
			Strength: "UPDATE",
		}).
		Where("order_id = ?", order.ID).
		Order("product_id ASC, id ASC").
		Find(&items).Error; err != nil {
		return fmt.Errorf(
			"gagal membaca item order: %w",
			err,
		)
	}

	if len(items) == 0 {
		return errors.New("order tidak memiliki item")
	}

	maxQuantity := int64(^uint(0) >> 1)

	for _, item := range items {
		if item.ProductID <= 0 || item.Quantity <= 0 || item.Quantity > maxQuantity {
			return fmt.Errorf("data order item %d tidak valid", item.ID)
		}

		if err := productRepo.RestoreStock(tx, item.ProductID, int(item.Quantity)); err != nil {
			return fmt.Errorf("gagal menambahkan stok produk %d: %w", item.ProductID, err)
		}
	}

	result := tx.Model(&models.Payment{}).
		Where("id = ? AND payment_status = ?", payment.ID, enum.PaymentPending).
		Update("payment_status", paymentStatus)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected != 1 {
		return errors.New("gagal memperbarui status payment")
	}

	result = tx.Model(&models.OrderProduct{}).
		Where("order_product = ?", order.ID, enum.OrderPending).
		Update("status_order", enum.OrderCancelled)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected != 1 {
		return errors.New("gagal memperbarui status order")
	}

	history := models.OrderStatusHistory{
		OrderID:        order.ID,
		StatusOrder:    enum.OrderCancelled,
		StatusShipment: order.StatusShipment,
		Title:          title,
		Description:    description,
	}

	if err := tx.Create(&history).Error; err != nil {
		return fmt.Errorf("gagal menyimpan riwayat pembatalan: %w", err)
	}

	return nil
}
