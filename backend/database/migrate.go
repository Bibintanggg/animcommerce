package database

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

func MigrateDB(db *gorm.DB) {
	db.AutoMigrate(
		&models.CartProduct{},
		&models.OrderItem{},
		&models.OrderProduct{},
		&models.Payment{},
		&models.Wishlist{},
		&models.Product{},
		&models.User{},
		&models.UserAddress{},
		&models.StockMovement{},
		&models.Discount{},
		&models.Review{},
		&models.ProductSize{},
	)
}
