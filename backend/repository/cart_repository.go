package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type CartRepository interface {
	GetCartByUserID(userID int64) (models.Cart, error)
	CreateCart(cart *models.Cart) error
	FindItem(cartID int64, productID int64) (models.CartProduct, error)
	CreateItem(item *models.CartProduct) error
	UpdateItem(item *models.CartProduct) error
	DeleteItem(cartID int64, productId int64) error
	GetCartItems(cartID int64) ([]models.CartProduct, error)
}

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) CartRepository {
	return &cartRepository{
		db: db,
	}
}

func (r *cartRepository) GetCartByUserID(userID int64) (models.Cart, error) {
	var cartProducts models.Cart
	err := r.db.Where("user_id = ?", userID).First(&cartProducts).Error
	return cartProducts, err
}

func (r *cartRepository) CreateCart(cart *models.Cart) error {
	return r.db.Create(cart).Error
}

func (r *cartRepository) FindItem(cartID int64, productID int64) (models.CartProduct, error) {
	var item models.CartProduct
	err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	return item, err
}

func (r *cartRepository) CreateItem(item *models.CartProduct) error {
	return r.db.Create(item).Error
}

func (r *cartRepository) UpdateItem(item *models.CartProduct) error {
	return r.db.Save(item).Error
}

func (r *cartRepository) DeleteItem(cartID int64, productID int64) error {
	return r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).Delete(&models.CartProduct{}).Error
}

func (r *cartRepository) GetCartItems(cartID int64) ([]models.CartProduct, error) {
	var items []models.CartProduct

	err := r.db.Where("cart_id = ?", cartID).Find(&items).Error

	return items, err
}
