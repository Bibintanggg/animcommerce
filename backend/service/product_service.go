package service

import (
	disc "animcommerce/backend/dto/cart"
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"animcommerce/backend/storage/images" // sesuaikan path package images kamu
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gosimple/slug"
)

type ProductService interface {
	GetProducts(filter dto.ProductFilter) ([]models.Product, int64, error)
	GetPublishedProducts(filter dto.ProductFilter) ([]models.Product, int64, error)
	GetProductDetails(slug string) (models.Product, error)
	GetPublishedProductDetails(slug string) (models.Product, error)
	CreateProduct(userID int64, request dto.CreateProductRequest, fileHeader *multipart.FileHeader) (dto.ProductResponse, error)
	UpdateProduct(id int64, request dto.UpdateProductRequest, fileHeader *multipart.FileHeader) (models.Product, error)
	DeleteProduct(id int64) error
	GetStockMovements(period string) ([]dto.StockMovementResponse, error)
	ApplyDiscount(request disc.ApplyDiscountRequest) (disc.ApplyDiscountResponse, error)
}

type productService struct {
	repo    repository.ProductRepository
	storage images.Storage
}

const maxProductImageSize = 5 << 20

var allowedProductImageTypes = map[string]struct{}{
	"image/jpeg": {},
	"image/png":  {},
	"image/webp": {},
}

func validateProductImage(fileHeader *multipart.FileHeader) error {
	if fileHeader == nil {
		return errors.New("thumbnail is required")
	}
	if fileHeader.Size <= 0 || fileHeader.Size > maxProductImageSize {
		return errors.New("thumbnail must be smaller than 5 MB")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return errors.New("unable to read thumbnail")
	}
	defer file.Close()

	header := make([]byte, 512)
	bytesRead, err := file.Read(header)
	if err != nil && bytesRead == 0 {
		return errors.New("unable to read thumbnail")
	}
	contentType := http.DetectContentType(header[:bytesRead])
	if _, allowed := allowedProductImageTypes[contentType]; !allowed {
		return errors.New("thumbnail must be a JPEG, PNG, or WebP image")
	}

	return nil
}

func NewProductService(repo repository.ProductRepository, storage images.Storage) ProductService {
	return &productService{
		repo:    repo,
		storage: storage,
	}
}

func (s *productService) GetProducts(filter dto.ProductFilter) ([]models.Product, int64, error) {
	return s.repo.FindAll(filter)
}

func (s *productService) GetPublishedProducts(filter dto.ProductFilter) ([]models.Product, int64, error) {
	return s.repo.FindPublished(filter)
}

func (s *productService) GetProductDetails(slug string) (models.Product, error) {
	return s.repo.FindBySlug(slug)
}

func (s *productService) GetPublishedProductDetails(slug string) (models.Product, error) {
	return s.repo.FindPublishedBySlug(slug)
}

func (s *productService) CreateProduct(userID int64, request dto.CreateProductRequest, fileHeader *multipart.FileHeader) (dto.ProductResponse, error) {
	if request.Stock < 0 {
		return dto.ProductResponse{}, errors.New("stock cannot be negative")
	}
	if request.Price < 0 {
		return dto.ProductResponse{}, errors.New("price must be greater than 0")
	}
	if err := validateProductImage(fileHeader); err != nil {
		return dto.ProductResponse{}, err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return dto.ProductResponse{}, err
	}
	defer file.Close()

	thumbnailURL, _, err := s.storage.Upload(file, fileHeader.Filename)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	product := models.Product{
		UserID:      userID,
		Title:       request.Title,
		Thumbnail:   thumbnailURL, // pakai hasil upload, bukan request.Thumbnail
		Slug:        request.Slug,
		Description: request.Description,
		Price:       int(request.Price),
		Stock:       request.Stock,
		IsActive:    enum.ProductStatus(request.IsActive),
		Category:    enum.ProductCategory(request.Category),
		IsFeatured:  request.IsFeatured,
	}

	if err := s.repo.Create(&product); err != nil {
		return dto.ProductResponse{}, err
	}

	if request.Discount != "" {
		var discountRequest dto.DiscountRequest

		if err := json.Unmarshal(
			[]byte(request.Discount),
			&discountRequest,
		); err != nil {
			return dto.ProductResponse{}, err
		}

		discount := models.Discount{
			ProductID:   product.ID,
			Code:        discountRequest.Code,
			Type:        discountRequest.Type,
			Value:       int(discountRequest.Value),
			MinPurchase: int(discountRequest.MinPurchase),
			MaxDiscount: int(discountRequest.MaxDiscount),
			UsageLimit:  discountRequest.UsageLimit,
			IsActive:    discountRequest.IsActive,
		}

		if err := s.repo.CreateDiscount(&discount); err != nil {
			return dto.ProductResponse{}, err
		}
	}

	if request.Sizes != "" {
		var sizes []string

		if err := json.Unmarshal(
			[]byte(request.Sizes),
			&sizes,
		); err != nil {
			return dto.ProductResponse{}, err
		}

		for _, size := range sizes {
			size = strings.TrimSpace(size)

			if size == "" {
				continue
			}

			productSize := models.ProductSize{
				ProductID: product.ID,
				Size:      size,
			}

			if err := s.repo.CreateProductSize(&productSize); err != nil {
				return dto.ProductResponse{}, err
			}
		}
	}

	if err := s.repo.LoadUser(&product); err != nil {
		return dto.ProductResponse{}, err
	}

	return dto.ProductResponse{
		ID:          product.ID,
		Title:       product.Title,
		Price:       product.Price,
		SellerName:  product.User.Name,
		SellerEmail: product.User.Email,
		Stock:       product.Stock,
	}, nil
}

func (s *productService) UpdateProduct(id int64, request dto.UpdateProductRequest, fileHeader *multipart.FileHeader) (models.Product, error) {
	if request.Stock < 0 {
		return models.Product{}, errors.New("stock cannot be negative")
	}
	if request.Price < 0 {
		return models.Product{}, errors.New("price must be greater than 0")
	}

	product, err := s.repo.FindByID(id)
	if err != nil {
		return models.Product{}, err
	}

	oldStock := product.Stock
	newStock := request.Stock

	product.Title = request.Title
	product.Slug = slug.Make(request.Title)
	product.Description = request.Description
	product.Price = int(request.Price)
	product.Stock = newStock
	product.IsActive = enum.ProductStatus(request.IsActive)
	product.Category = enum.ProductCategory(request.Category)
	product.IsFeatured = request.IsFeatured

	if request.Sizes != "" {
		var sizes []string

		if err := json.Unmarshal(
			[]byte(request.Sizes),
			&sizes,
		); err != nil {
			return models.Product{}, err
		}

		if err := s.repo.DeleteProductSize(product.ID); err != nil {
			return models.Product{}, err
		}

		for _, size := range sizes {
			size = strings.TrimSpace(size)

			if size == "" {
				continue
			}

			productSize := models.ProductSize{
				ProductID: product.ID,
				Size:      size,
			}

			if err := s.repo.CreateProductSize(&productSize); err != nil {
				return models.Product{}, err
			}
		}
	}

	if fileHeader != nil {
		if err := validateProductImage(fileHeader); err != nil {
			return models.Product{}, err
		}
		file, err := fileHeader.Open()
		if err != nil {
			return models.Product{}, err
		}
		defer file.Close()

		thumbnailURL, _, err := s.storage.Upload(file, fileHeader.Filename)
		if err != nil {
			return models.Product{}, err
		}

		product.Thumbnail = thumbnailURL
	}
	if err := s.repo.Update(&product); err != nil {
		return models.Product{}, err
	}

	if request.Discount != "" {
		var discountRequest dto.DiscountRequest
		if err := json.Unmarshal(
			[]byte(request.Discount),
			&discountRequest,
		); err != nil {
			return models.Product{}, err
		}

		if err := s.repo.DeleteDiscount(product.ID); err != nil {
			return models.Product{}, err
		}

		discount := models.Discount{
			ProductID:   product.ID,
			Code:        discountRequest.Code,
			Type:        discountRequest.Type,
			Value:       int(discountRequest.Value),
			MinPurchase: int(discountRequest.MinPurchase),
			MaxDiscount: int(discountRequest.MaxDiscount),
			UsageLimit:  discountRequest.UsageLimit,
			IsActive:    discountRequest.IsActive,
		}

		if err := s.repo.CreateDiscount(&discount); err != nil {
			return models.Product{}, err
		}
	}

	if oldStock != newStock {
		movementType := enum.StockIn
		quantity := newStock - oldStock

		if quantity < 0 {
			movementType = enum.StockOut
			quantity = -quantity
		}

		movement := models.StockMovement{
			ProductID:   product.ID,
			Type:        movementType,
			Quantity:    quantity,
			StockBefore: oldStock,
			StockAfter:  newStock,
		}

		if err := s.repo.CreateStockMovement(&movement); err != nil {
			return models.Product{}, err
		}
	}

	return product, err
}

func (s *productService) DeleteProduct(id int64) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if product.Thumbnail != "" {
		if err := s.storage.Delete(product.Thumbnail); err != nil {
			return err
		}
	}

	if err := s.repo.DeleteDiscount(product.ID); err != nil {
		return err
	}

	if err := s.repo.DeleteProductSize(product.ID); err != nil {
		return err
	}

	return s.repo.Delete(&product)
}

func parsePeriodRange(period string) (time.Time, time.Time, error) {
	trimmed := strings.TrimSpace(period)
	if trimmed == "" || strings.EqualFold(trimmed, "all") {
		return time.Time{}, time.Time{}, nil
	}

	switch strings.ToLower(trimmed) {
	case "today":
		now := time.Now()
		start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		return start, start.AddDate(0, 0, 1).Add(-time.Nanosecond), nil
	case "week":
		now := time.Now()
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start := time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, now.Location())
		return start, start.AddDate(0, 0, 7).Add(-time.Nanosecond), nil
	case "month":
		now := time.Now()
		start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		return start, start.AddDate(0, 1, 0).Add(-time.Nanosecond), nil
	case "year":
		now := time.Now()
		start := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		return start, start.AddDate(1, 0, 0).Add(-time.Nanosecond), nil
	}

	parts := strings.Split(trimmed, ",")
	if len(parts) == 2 {
		start, err := time.Parse("2006-01-02", strings.TrimSpace(parts[0]))
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		end, err := time.Parse("2006-01-02", strings.TrimSpace(parts[1]))
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		return start, end, nil
	}

	return time.Time{}, time.Time{}, errors.New("invalid period format")
}

func (s *productService) GetStockMovements(
	period string,
) ([]dto.StockMovementResponse, error) {

	start, end, err := parsePeriodRange(period)
	if err != nil {
		return nil, err
	}

	movements, err := s.repo.GetStockMovements(start, end)

	if err != nil {
		return nil, err
	}

	result := make([]dto.StockMovementResponse, 0)

	for _, movement := range movements {
		result = append(result, dto.StockMovementResponse{
			Date:  movement.CreatedAt.Format("2006-01-02"),
			Stock: movement.StockAfter,
			Value: movement.StockAfter * movement.Product.Price,
		})
	}

	return result, nil
}

func (s *productService) ApplyDiscount(
	request disc.ApplyDiscountRequest,
) (disc.ApplyDiscountResponse, error) {

	code := strings.TrimSpace(request.Code)

	if code == "" {
		return disc.ApplyDiscountResponse{}, errors.New("voucher code is required")
	}

	discount, err := s.repo.FindDiscountByCode(code)
	if err != nil {
		return disc.ApplyDiscountResponse{}, errors.New("voucher tidak ditemukan")
	}

	if !discount.IsActive {
		return disc.ApplyDiscountResponse{}, errors.New("voucher tidak aktif")
	}

	if discount.MinPurchase > 0 &&
		request.Subtotal < discount.MinPurchase {
		return disc.ApplyDiscountResponse{}, errors.New(
			"minimum pembelian belum terpenuhi",
		)
	}

	if discount.UsageLimit > 0 &&
		discount.UsedCount >= discount.UsageLimit {
		return disc.ApplyDiscountResponse{}, errors.New(
			"voucher sudah mencapai batas penggunaan",
		)
	}

	now := time.Now()

	if discount.StartAt != nil && now.Before(*discount.StartAt) {
		return disc.ApplyDiscountResponse{}, errors.New(
			"voucher belum berlaku",
		)
	}

	if discount.EndAt != nil && now.After(*discount.EndAt) {
		return disc.ApplyDiscountResponse{}, errors.New(
			"voucher sudah expired",
		)
	}

	var discountAmount int

	switch strings.ToLower(discount.Type) {

	case "percentage":
		discountAmount = request.Subtotal * discount.Value / 100

	case "fixed":
		discountAmount = discount.Value

	default:
		return disc.ApplyDiscountResponse{}, errors.New(
			"jenis discount tidak valid",
		)
	}

	// Jangan sampai discount lebih besar dari subtotal
	if discountAmount > request.Subtotal {
		discountAmount = request.Subtotal
	}

	// MaxDiscount
	if discount.MaxDiscount > 0 &&
		discountAmount > discount.MaxDiscount {
		discountAmount = discount.MaxDiscount
	}

	return disc.ApplyDiscountResponse{
		Code:     discount.Code,
		Discount: discountAmount,
	}, nil
}
