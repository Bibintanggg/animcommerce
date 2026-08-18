package repository

import (
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll(filter dto.ProductFilter) ([]models.Product, int64, error)
	FindBySlug(slug string) (models.Product, error)
	FindByID(id int64) (models.Product, error)
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(product *models.Product) error
	LoadUser(product *models.Product) error
	ReduceStock(tx *gorm.DB, productID int64, qty int) error
	CreateStockMovement(movement *models.StockMovement) error
	GetStockMovements(startDate time.Time, endDate time.Time) ([]models.StockMovement, error)
	CreateDiscount(discount *models.Discount) error
	DeleteDiscount(productID int64) error
	CreateProductSize(size *models.ProductSize) error
	DeleteProductSize(productID int64) error
	FindDiscountByCode(code string) (models.Discount, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{
		db: db,
	}
}

func (r *productRepository) FindAll(filter dto.ProductFilter) ([]models.Product, int64, error) {
	var (
		products []models.Product
		total    int64
	)
	query := r.db.Model(&models.Product{}).Preload("User").Preload("Discounts").Preload("Size")

	if filter.Search != "" {
		query = query.Where("title LIKE ?", "%"+filter.Search+"%")
	}
	query.Count(&total)
	err := query.
		Offset((filter.Page - 1) * filter.Limit).
		Limit(filter.Limit).
		Find(&products).Error

	return products, total, err
}

func (r *productRepository) FindBySlug(slug string) (models.Product, error) {
	var product models.Product
	err := r.db.Preload("User").Preload("Discounts").Preload("Size").Where("slug = ?", slug).First(&product).Error
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

	var product models.Product

	if err := tx.
		Where("id = ?", productID).
		First(&product).Error; err != nil {
		return err
	}

	if product.Stock < qty {
		return errors.New("stock not enough")
	}

	oldStock := product.Stock
	newStock := oldStock - qty

	result := tx.
		Model(&models.Product{}).
		Where("id = ? AND stock >= ?", productID, qty).
		Update("stock", newStock)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("stock update failed")
	}

	movement := models.StockMovement{
		ProductID:   productID,
		Type:        enum.StockOut,
		Quantity:    qty,
		StockBefore: oldStock,
		StockAfter:  newStock,
	}

	if err := tx.Create(&movement).Error; err != nil {
		return err
	}

	return nil
}
func (r *productRepository) CreateStockMovement(movement *models.StockMovement) error {
	return r.db.Create(movement).Error
}

func (r *productRepository) GetStockMovements(startDate time.Time, endDate time.Time) ([]models.StockMovement, error) {
	var movements []models.StockMovement
	err := r.db.Preload("Product").Where("created_at >= ? AND created_at <= ?", startDate, endDate).Order("created_at ASC").Find(&movements).Error

	return movements, err
}

func (r *productRepository) CreateDiscount(discount *models.Discount) error {
	return r.db.Create(discount).Error
}

func (r *productRepository) CreateProductSize(size *models.ProductSize) error {
	return r.db.Create(size).Error
}

func (r *productRepository) DeleteProductSize(productID int64) error {
	return r.db.Where("product_id = ?", productID).Delete(&models.ProductSize{}).Error
}

func (r *productRepository) DeleteDiscount(productID int64) error {
	return r.db.Where("product_id = ?", productID).Delete(&models.Discount{}).Error
}

func (r *productRepository) FindDiscountByCode(code string) (models.Discount, error) {
	var discount models.Discount

	err := r.db.Where("code = ?", code).First(&discount).Error

	return discount, err
}
