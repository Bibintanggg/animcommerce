package service

import (
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"animcommerce/backend/storage/images" // sesuaikan path package images kamu
	"errors"
	"mime/multipart"
)

type ProductService interface {
	GetProducts() ([]models.Product, error)
	GetProductDetails(slug string) (models.Product, error)
	CreateProduct(userID int64, request dto.CreateProductRequest, fileHeader *multipart.FileHeader) (dto.ProductResponse, error)
	UpdateProduct(id int64, request dto.UpdateProductRequest) (models.Product, error)
	DeleteProduct(id int64) error
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

func (s *productService) GetProducts() ([]models.Product, error) {
	return s.repo.FindAll()
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

func (s *productService) UpdateProduct(id int64, request dto.UpdateProductRequest) (models.Product, error) {
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

	product.Title = request.Title
	product.Thumbnail = request.Thumbnail
	product.Description = request.Description
	product.Price = int(request.Price)
	product.Stock = request.Stock
	product.IsActive = enum.ProductStatus(request.IsActive)
	product.Category = enum.ProductCategory(request.Category)

	if err := s.repo.Update(&product); err != nil {
		return models.Product{}, err
	}

	return product, nil
}

func (s *productService) DeleteProduct(id int64) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(&product)
}
