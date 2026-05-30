package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() ([]models.User, error)
	Create(user *models.User) error
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

	err := r.db.Find(&users).Error
	return users, err
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}
