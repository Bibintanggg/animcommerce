package repository

import (
	dto "animcommerce/backend/dto/order"
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	GetAllOrders(filter dto.OrderFilter) ([]models.OrderProduct, error)
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

func (r *orderRepository) GetAllOrders(filter dto.OrderFilter) ([]models.OrderProduct, error) {
	var orders []models.OrderProduct

	query := r.db.
		Preload("User").
		Preload("UserAddress").
		Preload("OrderItem").
		Preload("OrderItem.Product").
		Order("created_at DESC")

	if filter.Search != "" {
		search := "%" + filter.Search + "%"

		query = query.
			Joins("JOIN users ON users.id = order_products.user_id").
			Where(
				"order_products.order_number LIKE ? OR users.name LIKE ?",
				search,
				search,
			)
	}

	if filter.Limit > 0 {
		offset := (filter.Page - 1) * filter.Limit

		query = query.
			Offset(offset).
			Limit(filter.Limit)
	}

	err := query.Find(&orders).Error

	return orders, err
}
