package service

import (
	dto "animcommerce/backend/dto/order"
	"animcommerce/backend/helper"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

type OrderService interface {
	Checkout(userID int64, req dto.CheckoutRequest) error
	GetMyOrders(userID int64) ([]models.OrderProduct, error)
	GetOrderDetail(userID int64, orderID int64) (*models.OrderProduct, error)
	UpdateOrderStatus(orderID int64, req dto.UpdateOrderStatusRequest) error
}

type orderService struct {
	db              *gorm.DB
	orderRepo       repository.OrderRepository
	orderItemRepo   repository.OrderItemRepository
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
	addressRepo     repository.UserAddressRepository
}

func NewOrderService(db *gorm.DB, orderRepo repository.OrderRepository, orderItemRepo repository.OrderItemRepository,
	cartRepo repository.CartRepository, cartProductRepo repository.CartProductRepository, productRepo repository.ProductRepository,
	addressRepo repository.UserAddressRepository) OrderService {
	return &orderService{
		db:            db,
		orderRepo:     orderRepo,
		orderItemRepo: orderItemRepo,

		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,

		productRepo: productRepo,
		addressRepo: addressRepo,
	}
}

func (s *orderService) Checkout(userID int64, req dto.CheckoutRequest) error {
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	address, err := s.addressRepo.FindByID(req.AddressID)
	if err != nil {
		tx.Rollback()
		return err
	}

	if address.UserID != userID {
		tx.Rollback()
		return errors.New("Address not found")
	}

	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		tx.Rollback()
		return err
	}

	items, err := s.cartProductRepo.GetCartByID(cart.ID)
	if err != nil {
		tx.Rollback()
		return err
	}

	if len(items) == 0 {
		tx.Rollback()
		return errors.New("Cart is empty!")
	}

	var totalPrice int64

	for _, item := range items {
		product, err := s.productRepo.FindByID(item.ProductID)
		if err != nil {
			tx.Rollback()
			return err
		}

		if product.Stock < int(item.Quantity) {
			tx.Rollback()
			return errors.New("Stock not enough")
		}

		totalPrice += int64(product.Price) * int64(item.Quantity)
	}

	order := models.OrderProduct{
		OrderNumber:    helper.GenerateOrderNumber(),
		UserID:         userID,
		AddressID:      req.AddressID,
		TotalPrice:     totalPrice,
		ShippingCost:   13000,
		StatusOrder:    enum.OrderPending,
		StatusShipment: enum.ShipmentAwaitingPickup,
	}

	err = tx.Create(&order).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, item := range items {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  int64(item.Quantity),
			Price:     int64(item.Product.Price),
		}

		err = tx.Create(&orderItem).Error
		if err != nil {
			tx.Rollback()
			return err
		}

		product, err := s.productRepo.FindByID(item.ProductID)
		if err != nil {
			tx.Rollback()
			return err
		}

		product.Stock -= int(item.Quantity)
		err = tx.Save(product).Error
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	err = tx.Where("cart_id = ?", cart.ID).Delete(&models.CartProduct{}).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *orderService) GetMyOrders(userID int64) ([]models.OrderProduct, error) {
	return s.orderRepo.FindByUserID(userID)
}

func (s *orderService) GetOrderDetail(userID int64, orderID int64) (*models.OrderProduct, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, err
	}

	if order.UserID != userID {
		return nil, errors.New("Forbidden")
	}

	return order, nil
}

func (s *orderService) UpdateOrderStatus(orderID int64, req dto.UpdateOrderStatusRequest) error {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if req.StatusOrder != "" {
		order.StatusOrder = enum.StatusOrder(req.StatusOrder)

		if req.StatusOrder == string(enum.OrderCompleted) {
			now := time.Now()
			order.CompletedAt = &now
		}
	}

	if req.StatusShipment != "" {

		order.StatusShipment = enum.ShipmentStatus(req.StatusShipment)

		if req.StatusShipment == string(enum.ShipmentInTransit) {
			order.Courier = req.Courier
			order.TrackingNumber = req.TrackingNumber
			now := time.Now()
			order.ShippedAt = &now
		}
	}

	return s.orderRepo.Update(order)
}
