package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type WishlistRepository interface {
	FindByUserID(userID int64) ([]models.Wishlist, error)

	FindByUserAndProduct(
		userID int64,
		productID int64,
	) (models.Wishlist, error)

	Create(wishlist *models.Wishlist) error

	Delete(
		userID int64,
		productID int64,
	) error
}

type wishlistRepository struct {
	db *gorm.DB
}

func NewWishlistRepository(
	db *gorm.DB,
) WishlistRepository {
	return &wishlistRepository{
		db: db,
	}
}

func (r *wishlistRepository) FindByUserID(
	userID int64,
) ([]models.Wishlist, error) {
	var wishlists []models.Wishlist

	err := r.db.
		Preload("Product").
		Preload("Product.Reviews").
		Preload("Product.Discounts").
		Preload("Product.Size").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&wishlists).
		Error

	return wishlists, err
}

func (r *wishlistRepository) FindByUserAndProduct(
	userID int64,
	productID int64,
) (models.Wishlist, error) {
	var wishlist models.Wishlist

	err := r.db.
		Where(
			"user_id = ? AND product_id = ?",
			userID,
			productID,
		).
		First(&wishlist).
		Error

	return wishlist, err
}

func (r *wishlistRepository) Create(
	wishlist *models.Wishlist,
) error {
	return r.db.Create(wishlist).Error
}

func (r *wishlistRepository) Delete(
	userID int64,
	productID int64,
) error {
	result := r.db.
		Where(
			"user_id = ? AND product_id = ?",
			userID,
			productID,
		).
		Delete(&models.Wishlist{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
