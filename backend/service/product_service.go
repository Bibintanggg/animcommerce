package service

import (
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"animcommerce/backend/storage/images" // sesuaikan path package images kamu
	"errors"
	"mime/multipart"
	"strings"
	"time"

	"github.com/gosimple/slug"
)

type ProductService interface {
	GetProducts(filter dto.ProductFilter) ([]models.Product, int64, error)
	GetProductDetails(slug string) (models.Product, error)
	CreateProduct(userID int64, request dto.CreateProductRequest, fileHeader *multipart.FileHeader) (dto.ProductResponse, error)
	UpdateProduct(id int64, request dto.UpdateProductRequest, fileHeader *multipart.FileHeader) (models.Product, error)
	DeleteProduct(id int64) error
	GetStockMovements(period string) ([]dto.StockMovementResponse, error)
}

type productService struct {
	repo    repository.ProductRepository
	storage images.Storage
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

func (s *productService) GetProductDetails(slug string) (models.Product, error) {
	return s.repo.FindBySlug(slug)
}

func (s *productService) CreateProduct(userID int64, request dto.CreateProductRequest, fileHeader *multipart.FileHeader) (dto.ProductResponse, error) {
	if request.Stock < 0 {
		return dto.ProductResponse{}, errors.New("stock cannot be negative")
	}
	if request.Price < 0 {
		return dto.ProductResponse{}, errors.New("price must be greater than 0")
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
	}

	if err := s.repo.Create(&product); err != nil {
		return dto.ProductResponse{}, err
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

	if fileHeader != nil {
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
