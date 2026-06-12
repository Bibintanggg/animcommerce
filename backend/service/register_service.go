package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterService interface {
	Register(req dto.RegisterRequest) error
}

type registerService struct {
	repo repository.RegisterRepository
}

func NewRegisterService(repo repository.RegisterRepository) RegisterService {
	return &registerService{
		repo: repo,
	}
}

func (s *registerService) Register(
	req dto.RegisterRequest,
) error {

	_, err := s.repo.FindByEmail(req.Email)

	if err == nil {
		return gorm.ErrDuplicatedKey
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),

		Role: enum.CustomerRole,
	}

	return s.repo.CreateUser(&user)
}
