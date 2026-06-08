package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Create(order *models.OrderProduct) error
	FindByID(id int64) (*models.OrderProduct, error)
	FindByUserID(userID int64) ([]models.OrderProduct, error)
	Update(order *models.OrderProduct) error
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{
		db: db,
	}
}

func (r *orderRepository) Create(order *models.OrderProduct) error {
	return r.db.Create(order).Error
}

func (r *orderRepository) FindByID(id int64) (*models.OrderProduct, error) {
	var order models.OrderProduct
	err := r.db.Preload("User").Preload("UserAddress").Preload("OrderItem.Product").First(&order, id).Error
	return &order, err
}

func (r *orderRepository) FindByUserID(userID int64) ([]models.OrderProduct, error) {
	var order []models.OrderProduct
	err := r.db.Preload("User").Preload("UserAddress").Preload("OrderItem.Product").Where("user_id = ?", userID).Order("created_at DESC").Find(&order).Error
	return order, err
}

func (r *orderRepository) Update(order *models.OrderProduct) error {
	return r.db.Save(order).Error
}
