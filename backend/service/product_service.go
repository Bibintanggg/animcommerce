package service

import (
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"
)

type ProductService interface {
	GetProducts() ([]models.Product, error)
	GetProductDetails(slug string) (models.Product, error)
	CreateProduct(userID int64, request dto.CreateProductRequest) (dto.ProductResponse, error)
	UpdateProduct(id int64, request dto.UpdateProductRequest) (models.Product, error)
	DeleteProduct(id int64) error
}

type productService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{
		repo: repo,
	}
}

func (s *productService) GetProducts() ([]models.Product, error) {
	return s.repo.FindAll()
}

func (s *productService) GetProductDetails(slug string) (models.Product, error) {
	return s.repo.FindBySlug(slug)
}

func (s *productService) CreateProduct(userID int64, request dto.CreateProductRequest) (dto.ProductResponse, error) {

	if request.Stock < 0 {
		return dto.ProductResponse{}, errors.New("Stock cannot be negative")
	}

	if request.Price < 0 {
		return dto.ProductResponse{}, errors.New("Price must be greater than 0")
	}

	product := models.Product{
		UserID:      userID,
		Title:       request.Title,
		Thumbnail:   request.Thumbnail,
		Slug:        request.Slug,
		Description: request.Description,
		Price:       request.Price,
		Stock:       request.Stock,
	}

	err := s.repo.Create(&product)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	err = s.repo.LoadUser(&product)
	if err != nil {
		return dto.ProductResponse{}, err
	}

	response := dto.ProductResponse{
		ID:          product.ID,
		Title:       product.Title,
		Price:       product.Price,
		SellerName:  product.User.Name,
		SellerEmail: product.User.Email,
		Stock:       product.Stock,
	}

	return response, nil
}

func (s *productService) UpdateProduct(id int64, request dto.UpdateProductRequest) (models.Product, error) {
	if request.Stock < 0 {
		return models.Product{}, errors.New("Stock cannot be negative")
	}
	if request.Price < 0 {
		return models.Product{}, errors.New("Price must be greater than 0")
	}

	product, err := s.repo.FindByID(id)
	if err != nil {
		return models.Product{}, err
	}

	product.Title = request.Title
	product.Thumbnail = request.Thumbnail
	product.Description = request.Description
	product.Price = request.Price
	product.Stock = request.Stock
	product.IsActive = enum.ProductStatus(request.IsActive)
	product.Category = enum.ProductCategory(request.Category)

	err = s.repo.Update(&product)
	// if err != nil {
	// 	return models.Product{}, err
	// }

	return product, nil
}

func (s *productService) DeleteProduct(id int64) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	return s.repo.Delete(&product)
}
