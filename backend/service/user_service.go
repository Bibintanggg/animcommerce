package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
)

type UserService interface {
	GetAllUser(filter dto.UserFilter) ([]models.User, int64, error)
	CreateUser(user models.User) (models.User, error)
	CreateUserWithAddress(user models.User, address models.UserAddress) (models.User, error)
	UpdateUser(id uint, user models.User) (models.User, error)
}

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) GetAllUser(filter dto.UserFilter) ([]models.User, int64, error) {
	return s.repo.FindAll(filter)
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

func (s *userService) UpdateUser(id uint, user models.User) (models.User, error) {
	existingUser, err := s.repo.FindById(id)
	if err != nil {
		return models.User{}, err
	}

	existingUser.Name = user.Name
	existingUser.Email = user.Email
	existingUser.Role = user.Role

	if err := s.repo.Update(existingUser); err != nil {
		return models.User{}, err
	}

	return *existingUser, err
}
