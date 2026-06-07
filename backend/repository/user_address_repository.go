package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type UserAddressRepository interface {
	FindByID(id int64) (*models.UserAddress, error)
}

type userAddressRepository struct {
	db *gorm.DB
}

func NewUserAddressRepository(db *gorm.DB) UserAddressRepository {
	return &userAddressRepository{
		db: db,
	}
}

func (r *userAddressRepository) FindByID(id int64) (*models.UserAddress, error) {
	var items models.UserAddress
	err := r.db.First(&items, id).Error
	return &items, err
}