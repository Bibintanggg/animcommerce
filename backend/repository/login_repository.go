package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type LoginRepository interface {
	FindByEmail(email string) (models.User, error)
}

type loginRepository struct {
	db *gorm.DB
}

func NewLoginRepository(db *gorm.DB) LoginRepository {
	return &loginRepository{
		db: db,
	}
}

func (r *loginRepository) FindByEmail(email string) (models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return user, err
}
