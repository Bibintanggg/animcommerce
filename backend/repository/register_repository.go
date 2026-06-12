package repository

import (
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type RegisterRepository interface {
	CreateUser(user *models.User) error
	FindByEmail(email string) (*models.User, error)
}

type registerRepository struct {
	db *gorm.DB
}

func NewRegisterRepository(db *gorm.DB) RegisterRepository {
	return &registerRepository{
		db: db,
	}
}

func (r *registerRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *registerRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	err := r.db.
		Where("email = ?", email).
		First(&user).
		Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}
