package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type OrderItemRepository interface {
	Create(item *models.OrderItem) error
	GetByOrderID(orderID int64) ([]models.OrderItem, error)
}

type orderItemRepository struct {
	db *gorm.DB
}

func NewOrderItemRepository(db *gorm.DB) OrderItemRepository {
	return &orderItemRepository{
		db: db,
	}
}

func (r *orderItemRepository) Create(item *models.OrderItem) error {
	return r.db.Create(item).Error
}

func (r *orderItemRepository) GetByOrderID(orderID int64) ([]models.OrderItem, error) {
	var items []models.OrderItem

	err := r.db.Preload("Product").Where("order_id = ?", orderID).Find(&items).Error
	return items, err
}
