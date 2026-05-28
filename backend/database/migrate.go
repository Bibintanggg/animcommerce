package database

import (
	"animcommerce/backend/config"
	"animcommerce/backend/models"
)

func MigrateDB() {
	config.DB.AutoMigrate(
		&models.CartProduct{},
		&models.OrderItem{},
		&models.OrderProduct{},
		&models.Payment{},
		&models.Product{},
		&models.User{},
		&models.UserAddress{},
	)
}
