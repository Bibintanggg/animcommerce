package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"

	"gorm.io/gorm"
)

var (
	ErrWishlistNotFound = errors.New(
		"wishlist not found",
	)

	ErrWishlistAlreadyExists = errors.New(
		"product already exists in wishlist",
	)

	ErrWishlistProductNotFound = errors.New(
		"product not found",
	)
)

type WishlistService interface {
	GetWishlist(userID int64) ([]models.Wishlist, error)
	AddWishlist(userID int64, productID int64) (models.Wishlist, error)
	RemoveWishlist(userID int64, productID int64) error
}

type wishlistService struct {
	wishlistRepo repository.WishlistRepository
	productRepo  repository.ProductRepository
}

func NewWishlistService(wishlistRepo repository.WishlistRepository, productRepo repository.ProductRepository) WishlistService {
	return &wishlistService{
		wishlistRepo: wishlistRepo,
		productRepo:  productRepo,
	}
}

func (s *wishlistService) GetWishlist(userID int64) ([]models.Wishlist, error) {
	return s.wishlistRepo.FindByUserID(userID)
}

func (s *wishlistService) AddWishlist(userID int64, productID int64) (models.Wishlist, error) {
	product, err := s.productRepo.FindByID(productID)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Wishlist{},
			ErrWishlistProductNotFound
	}

	if err != nil {
		return models.Wishlist{}, err
	}

	if product.IsActive != enum.ProductPublished {
		return models.Wishlist{},
			ErrWishlistProductNotFound
	}

	existing, err :=
		s.wishlistRepo.FindByUserAndProduct(
			userID,
			productID,
		)

	if err == nil && existing.ID != 0 {
		return models.Wishlist{},
			ErrWishlistAlreadyExists
	}

	if err != nil &&
		!errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Wishlist{}, err
	}

	wishlist := models.Wishlist{
		UserID:    userID,
		ProductID: productID,
		Product:   product,
	}

	if err := s.wishlistRepo.Create(&wishlist); err != nil {
		return models.Wishlist{}, err
	}

	return wishlist, nil
}

func (s *wishlistService) RemoveWishlist(userID int64, productID int64) error {
	err := s.wishlistRepo.Delete(
		userID,
		productID,
	)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrWishlistNotFound
	}

	return err
}
