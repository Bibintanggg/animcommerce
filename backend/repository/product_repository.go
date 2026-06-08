package repository

import (
	"animcommerce/backend/models"
	"errors"

	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll() ([]models.Product, error)
	FindBySlug(slug string) (models.Product, error)
	FindByID(id int64) (models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(product *models.Product) error
	LoadUser(product *models.Product) error
	ReduceStock(tx *gorm.DB, productID int64, qty int) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{
		db: db,
	}
}

func (r *productRepository) FindAll() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Preload("User").Find(&products).Error
	return products, err
}

func (r *productRepository) FindBySlug(slug string) (models.Product, error) {
	var product models.Product
	err := r.db.Preload("User").Where("slug = ?", slug).First(&product).Error
	return product, err
}

func (r *productRepository) FindByID(id int64) (models.Product, error) {
	var product models.Product
	err := r.db.First(&product, "id = ?", id).Error
	return product, err
}

func (r *productRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(product *models.Product) error {
	return r.db.Delete(product).Error
}

func (r *productRepository) LoadUser(product *models.Product) error {
	return r.db.Preload("User").First(product, product.ID).Error
}

func (r *productRepository) ReduceStock(tx *gorm.DB, productID int64, qty int) error {
	result := tx.Model(&models.Product{}).Where("id = ? AND stock >= ?", productID, qty).Update("stock", gorm.Expr("stock - ?", qty))

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("Stock not enough")
	}

	return nil
}
