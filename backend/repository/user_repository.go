package repository

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll(filter dto.UserFilter) ([]models.User, int64, error)
	Create(user *models.User) error
	CreateWithAddress(user *models.User, address *models.UserAddress) error
	FindById(id uint) (*models.User, error)
	Update(user *models.User) error
	Delete(user *models.User) error
	GetRecentRegisteredUsers(limit int) ([]models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (r *userRepository) FindAll(filter dto.UserFilter) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.Model(&models.User{})

	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("name LIKE ? OR email LIKE ?", searchTerm, searchTerm)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (filter.Page - 1) * filter.Limit

	err := query.
		Preload("Addresses").
		Offset(offset).
		Limit(filter.Limit).
		Find(&users).Error

	return users, total, err
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

func (r *userRepository) FindById(id uint) (*models.User, error) {
	var user models.User

	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(user *models.User) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", user.ID).Delete(&models.UserAddress{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(user).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *userRepository) GetRecentRegisteredUsers(limit int) ([]models.User, error) {
	var users []models.User
	err := r.db.Order("created_at DESC").Limit(limit).Find(&users).Error
	if err != nil {
		return nil, err
	}
	return users, nil
}
