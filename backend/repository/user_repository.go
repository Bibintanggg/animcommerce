package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() ([]models.User, error)
	Create(user *models.User) error
	CreateWithAddress(user *models.User, address *models.UserAddress) error // ✅ Tambahkan ini
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) FindAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Addresses").Find(&users).Error // ✅ Preload addresses
	return users, err
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) CreateWithAddress(user *models.User, address *models.UserAddress) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		address.UserID = user.ID

		if err := tx.Create(address).Error; err != nil {
			return err
		}

		return nil
	})
}
