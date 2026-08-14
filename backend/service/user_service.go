package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	GetAllUser(filter dto.UserFilter) ([]models.User, int64, error)
	CreateUser(user models.User) (models.User, error)
	CreateUserWithAddress(user models.User, address models.UserAddress) (models.User, error)
	UpdateUser(id uint, user models.User) (models.User, error)
	DeleteUser(id uint) error
	GetRecentRegisteredUsers(limit int) ([]dto.RecentActivityResponse, error)
	ResetPassword(id uint, newPassword string) error
	GetMe(id uint) (models.User, error)
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

func (s *userService) DeleteUser(id uint) error {
	user, err := s.repo.FindById(id)
	if err != nil {
		return err
	}

	if user.Role == "superadmin" {
		return errors.New("Superadmin tidak dapat dihapus !!")
	}

	return s.repo.Delete(user)
}

func (s *userService) GetRecentRegisteredUsers(limit int) ([]dto.RecentActivityResponse, error) {
	users, err := s.repo.GetRecentRegisteredUsers(limit)
	if err != nil {
		return nil, err
	}

	activities := make([]dto.RecentActivityResponse, 0, len(users))
	for _, u := range users {
		activities = append(activities, dto.RecentActivityResponse{
			ID:     u.ID,
			User:   u.Name,
			Type:   "register",
			Detail: "Mendaftar sebagai pengguna baru",
			Time:   u.CreatedAt.Format(time.RFC3339),
		})
	}

	return activities, nil
}

func (s *userService) ResetPassword(id uint, newPassword string) error {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(newPassword),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	return s.repo.ResetPassword(id, string(hash))
}

func (s *userService) GetMe(id uint) (models.User, error) {
	user, err := s.repo.FindById(id)
	if err != nil {
		return models.User{}, err
	}

	return *user, nil
}
