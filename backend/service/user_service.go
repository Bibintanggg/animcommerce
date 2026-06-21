package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
)

type UserService interface {
	GetAllUser() ([]models.User, error)
	CreateUser(user models.User) (models.User, error)
	CreateUserWithAddress(user models.User, address models.UserAddress) (models.User, error) // ✅ Tambahkan
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAllUser() ([]models.User, error) {
	return s.repo.FindAll()
}

func (s *userService) CreateUser(user models.User) (models.User, error) {
	err := s.repo.Create(&user)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (s *userService) CreateUserWithAddress(user models.User, address models.UserAddress) (models.User, error) {
	err := s.repo.CreateWithAddress(&user, &address)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}
