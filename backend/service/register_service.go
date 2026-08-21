package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var ErrEmailAlreadyRegistered = errors.New("email already registered")

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
	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	_, err := s.repo.FindByEmail(req.Email)

	if err == nil {
		return ErrEmailAlreadyRegistered
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	user := models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),

		Role: enum.CustomerRole,
	}

	return s.repo.CreateUser(&user)
}
