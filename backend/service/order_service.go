package service

import (
	dto "animcommerce/backend/dto/order"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type OrderService interface {
	GetAllOrders(filter dto.OrderFilter) ([]models.OrderProduct, int64, error)
	CheckoutCart(userID int64, req dto.CheckoutRequest) (dto.CheckoutResponse, error)
	CheckoutProduct(userID int64, slug string, request dto.CheckoutProductRequest) (dto.CheckoutResponse, error)
	GetMyOrders(userID int64) ([]models.OrderProduct, error)
	GetOrderDetail(userID int64, orderID int64) (*models.OrderProduct, error)
	GetAdminOrderDetail(orderID int64) (*models.OrderProduct, error)
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
	invoiceService  InvoiceService
}

// helper
func calculateShippingCost(subtotal int64) int64 {
	if subtotal >= 500_000 {
		return 0
	}

	return 25_000
}

func NewOrderService(db *gorm.DB, orderRepo repository.OrderRepository, orderItemRepo repository.OrderItemRepository,
	cartRepo repository.CartRepository, cartProductRepo repository.CartProductRepository, productRepo repository.ProductRepository,
	addressRepo repository.UserAddressRepository, invoiceService InvoiceService) OrderService {
	return &orderService{
		db:            db,
		orderRepo:     orderRepo,
		orderItemRepo: orderItemRepo,

		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,

		productRepo:    productRepo,
		addressRepo:    addressRepo,
		invoiceService: invoiceService,
	}
}

func (s *orderService) GetAllOrders(filter dto.OrderFilter) ([]models.OrderProduct, int64, error) {
	orders, total, err := s.orderRepo.GetAllOrders(filter)
	if err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *orderService) CheckoutCart(userID int64, req dto.CheckoutRequest) (dto.CheckoutResponse, error) {
	var response dto.CheckoutResponse
	var createdOrder models.OrderProduct

	// Mencegah ID cart ganda dikirim dalam request.
	uniqueIDs := make(map[int64]struct{})

	for _, itemID := range req.CartItemIDs {
		if _, exists := uniqueIDs[itemID]; exists {
			return response, errors.New("terdapat item cart duplikat")
		}

		uniqueIDs[itemID] = struct{}{}
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		cart, err := s.cartRepo.GetCartByUserID(userID)
		if err != nil {
			return errors.New("cart tidak ditemukan")
		}

		cartItems, err := s.cartProductRepo.GetCartItemsByIDs(
			tx,
			cart.ID,
			req.CartItemIDs,
		)
		if err != nil {
			return err
		}

		// Memastikan user tidak mengirim ID cart milik orang lain.
		if len(cartItems) != len(req.CartItemIDs) {
			return errors.New("sebagian item cart tidak valid")
		}

		address := models.UserAddress{
			UserID:       userID,
			ReceiverName: req.Address.ReceiverName,
			PhoneNumber:  req.Address.PhoneNumber,
			AddressLine:  req.Address.AddressLine,
			Province:     req.Address.Province,
			City:         req.Address.City,
			District:     req.Address.District,
			PostalCode:   req.Address.PostalCode,
			IsDefault:    false,
		}

		if err := tx.Create(&address).Error; err != nil {
			return fmt.Errorf("gagal menyimpan alamat: %w", err)
		}

		var subtotal int64

		for _, item := range cartItems {
			if item.Quantity <= 0 {
				return errors.New("quantity produk tidak valid")
			}

			if item.Product.Stock < item.Quantity {
				return fmt.Errorf(
					"stok produk %s tidak mencukupi",
					item.Product.Title,
				)
			}

			subtotal += int64(item.Product.Price) * int64(item.Quantity)
		}

		shippingCost := calculateShippingCost(subtotal)
		grandTotal := subtotal + shippingCost

		createdOrder = models.OrderProduct{
			OrderNumber:  fmt.Sprintf("ORD-%d-%d", userID, time.Now().Unix()),
			UserID:       userID,
			AddressID:    address.ID,
			TotalPrice:   subtotal,
			ShippingCost: shippingCost,

			Courier:        "",
			TrackingNumber: "",

			StatusOrder:    enum.OrderPending,
			StatusShipment: enum.ShipmentAwaitingPickup,
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return fmt.Errorf("gagal membuat order: %w", err)
		}

		for _, item := range cartItems {
			orderItem := models.OrderItem{
				OrderID:   createdOrder.ID,
				ProductID: item.ProductID,
				Quantity:  int64(item.Quantity),
				Price:     int64(item.Product.Price),
			}

			if err := tx.Create(&orderItem).Error; err != nil {
				return fmt.Errorf("gagal membuat order item: %w", err)
			}

			if err := s.productRepo.ReduceStock(
				tx,
				item.ProductID,
				item.Quantity,
			); err != nil {
				return err
			}
		}

		payment := models.Payment{
			OrderID:       createdOrder.ID,
			PaymentMethod: req.PaymentMethod,
			Amount:        grandTotal,

			// COD masih pending sampai admin mengonfirmasi pembayaran.
			PaymentStatus: enum.PaymentPending,
		}

		if err := tx.Create(&payment).Error; err != nil {
			return fmt.Errorf("gagal membuat payment: %w", err)
		}

		// Hanya menghapus item yang dipilih customer.
		if err := s.cartProductRepo.DeleteCartItemsByIDs(
			tx,
			cart.ID,
			req.CartItemIDs,
		); err != nil {
			return err
		}

		response = dto.CheckoutResponse{
			OrderID:       createdOrder.ID,
			OrderNumber:   createdOrder.OrderNumber,
			Subtotal:      subtotal,
			ShippingCost:  shippingCost,
			GrandTotal:    grandTotal,
			PaymentMethod: req.PaymentMethod,
		}

		return nil
	})

	if err != nil {
		return response, err
	}

	go func(orderID int64) {
		if _, err := s.invoiceService.GenerateInvoice(orderID); err != nil {
			log.Printf("failed generating invoice: %v", err)
		}
	}(createdOrder.ID)

	return response, nil
}

func (s *orderService) CheckoutProduct(userID int64, slug string, request dto.CheckoutProductRequest) (dto.CheckoutResponse, error) {
	var response dto.CheckoutResponse
	var createdOrder models.OrderProduct

	if request.Quantity <= 0 {
		return response, errors.New("quantity produk tidak valid")
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Harga dan stok diambil dari database berdasarkan slug.
		product, err := s.productRepo.FindBySlug(slug)
		if err != nil {
			return errors.New("produk tidak ditemukan")
		}

		if product.IsActive != enum.ProductPublished {
			return errors.New("produk tidak tersedia")
		}

		if product.Stock < request.Quantity {
			return fmt.Errorf(
				"stok %s hanya tersisa %d",
				product.Title,
				product.Stock,
			)
		}

		address := models.UserAddress{
			UserID:       userID,
			ReceiverName: request.Address.ReceiverName,
			PhoneNumber:  request.Address.PhoneNumber,
			AddressLine:  request.Address.AddressLine,
			Province:     request.Address.Province,
			City:         request.Address.City,
			District:     request.Address.District,
			PostalCode:   request.Address.PostalCode,
			IsDefault:    false,
		}

		if err := tx.Create(&address).Error; err != nil {
			return fmt.Errorf(
				"gagal menyimpan alamat: %w",
				err,
			)
		}

		// Harga selalu dihitung dari database.
		subtotal := int64(product.Price) * int64(request.Quantity)

		shippingCost := int64(25_000)

		if subtotal >= 500_000 {
			shippingCost = 0
		}

		grandTotal := subtotal + shippingCost

		createdOrder = models.OrderProduct{
			OrderNumber: fmt.Sprintf(
				"ORD-%d-%d",
				userID,
				time.Now().UnixNano(),
			),
			UserID:         userID,
			AddressID:      address.ID,
			TotalPrice:     subtotal,
			ShippingCost:   shippingCost,
			Courier:        "",
			TrackingNumber: "",

			StatusOrder:    enum.OrderPending,
			StatusShipment: enum.ShipmentAwaitingPickup,
		}

		if err := tx.Create(&createdOrder).Error; err != nil {
			return fmt.Errorf(
				"gagal membuat order: %w",
				err,
			)
		}

		orderItem := models.OrderItem{
			OrderID:   createdOrder.ID,
			ProductID: product.ID,
			Quantity:  int64(request.Quantity),
			Price:     int64(product.Price),
		}

		if err := tx.Create(&orderItem).Error; err != nil {
			return fmt.Errorf(
				"gagal membuat order item: %w",
				err,
			)
		}

		// ReduceStock milikmu sudah menggunakan transaction
		// dan mengecek ketersediaan stok kembali.
		if err := s.productRepo.ReduceStock(
			tx,
			product.ID,
			request.Quantity,
		); err != nil {
			return err
		}

		payment := models.Payment{
			OrderID:       createdOrder.ID,
			PaymentMethod: request.PaymentMethod,
			Amount:        grandTotal,
			PaymentStatus: enum.PaymentPending,
		}

		if err := tx.Create(&payment).Error; err != nil {
			return fmt.Errorf(
				"gagal membuat payment: %w",
				err,
			)
		}

		response = dto.CheckoutResponse{
			OrderID:       createdOrder.ID,
			OrderNumber:   createdOrder.OrderNumber,
			Subtotal:      subtotal,
			ShippingCost:  shippingCost,
			GrandTotal:    grandTotal,
			PaymentMethod: request.PaymentMethod,
		}

		return nil
	})

	if err != nil {
		return response, err
	}

	go func(orderID int64) {
		if _, err := s.invoiceService.GenerateInvoice(orderID); err != nil {
			log.Printf(
				"gagal membuat invoice order %d: %v",
				orderID,
				err,
			)
		}
	}(createdOrder.ID)

	return response, nil
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

func (s *orderService) GetAdminOrderDetail(orderID int64) (*models.OrderProduct, error) {
	return s.orderRepo.FindByID(orderID)
}

func (s *orderService) UpdateOrderStatus(orderID int64, req dto.UpdateOrderStatusRequest) error {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return err
	}

	if req.StatusOrder != "" {
		if !isValidOrderStatus(req.StatusOrder) {
			return errors.New("invalid order status")
		}
		order.StatusOrder = enum.StatusOrder(req.StatusOrder)

		if req.StatusOrder == string(enum.OrderCompleted) {
			now := time.Now()
			order.CompletedAt = &now
		}
	}

	if req.StatusShipment != "" {
		if !isValidShipmentStatus(req.StatusShipment) {
			return errors.New("invalid shipment status")
		}
		if req.StatusShipment == string(enum.ShipmentInTransit) &&
			(req.Courier == "" || req.TrackingNumber == "") {
			return errors.New("courier and tracking number are required")
		}

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

func isValidOrderStatus(status string) bool {
	switch enum.StatusOrder(status) {
	case enum.OrderPending, enum.OrderProcessing, enum.OrderCancelled, enum.OrderCompleted:
		return true
	default:
		return false
	}
}

func isValidShipmentStatus(status string) bool {
	switch enum.ShipmentStatus(status) {
	case enum.ShipmentAwaitingPickup, enum.ShipmentInTransit, enum.ShipmentDelivered:
		return true
	default:
		return false
	}
}
