package repository

import (
	"animcommerce/backend/models"
	"errors"

	"gorm.io/gorm"
)

type CartProductRepository interface {
	Create(item *models.CartProduct) error
	FindByCartAndProduct(cartID int64, productID int64) (*models.CartProduct, error)
	GetCartByID(cartID int64) ([]models.CartProduct, error)
	Update(item *models.CartProduct) error
	DeleteByCartAndProduct(cartID int64, productID int64) error
	ClearCart(cartID int64) error
	GetCartItemsByIDs(tx *gorm.DB, cartID int64, itemIDs []int64) ([]models.CartProduct, error)
	DeleteCartItemsByIDs(tx *gorm.DB, cartID int64, itemIDs []int64) error
}

type cartProductRepository struct {
	db *gorm.DB
}

func NewCartProductRepository(db *gorm.DB) CartProductRepository {
	return &cartProductRepository{
		db: db,
	}
}

func (r *cartProductRepository) Create(item *models.CartProduct) error {
	return r.db.Create(item).Error
}

func (r *cartProductRepository) FindByCartAndProduct(cartID int64, productID int64) (*models.CartProduct, error) {
	var item models.CartProduct

	err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	return &item, err
}

func (r *cartProductRepository) GetCartByID(cartID int64) ([]models.CartProduct, error) {
	var items []models.CartProduct

	err := r.db.Preload("Product").Where("cart_id = ?", cartID).Find(&items).Error

	return items, err
}

func (r *cartProductRepository) Update(item *models.CartProduct) error {
	return r.db.Save(item).Error
}

func (r *cartProductRepository) DeleteByCartAndProduct(cartID int64, productID int64) error {
	return r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).Delete(&models.CartProduct{}).Error
}

func (r *cartProductRepository) ClearCart(cartID int64) error {
	return r.db.Where("cart_id = ?", cartID).Delete(&models.CartProduct{}).Error
}

func (r *cartProductRepository) GetCartItemsByIDs(tx *gorm.DB, cartID int64, itemIDs []int64) ([]models.CartProduct, error) {
	var items []models.CartProduct
	err := tx.Preload("Product").Where("cart_id = ? AND id IN ?", cartID, itemIDs).Find(&items).Error
	return items, err
}

func (r *cartProductRepository) DeleteCartItemsByIDs(tx *gorm.DB, cartID int64, itemIDs []int64) error {
	result := tx.Where("cart_id = ? AND id IN ?", cartID, itemIDs).Delete(&models.CartProduct{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected != int64(len(itemIDs)) {
		return errors.New("Sebagian cart gagal dihapus")
	}

	return nil
}
