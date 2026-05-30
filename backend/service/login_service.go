package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/helper"
	"animcommerce/backend/repository"
	"errors"
)

type LoginService interface {
	Login(req dto.LoginRequest) (string, error)
}

type loginService struct {
	repo repository.LoginRepository
}

func NewLoginService(repo repository.LoginRepository) LoginService {
	return &loginService{
		repo: repo,
	}
}

func (s *loginService) Login(req dto.LoginRequest) (string, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return "", errors.New("Invalid email")
	}

	if user.Password != req	.Password {
		return "", errors.New("Invalid password")
	}

	token, err := helper.GenerateToken(user.ID)
	if err != nil {
		return "", errors.New("Failed to generate token")
	}
	return token, nil
}
