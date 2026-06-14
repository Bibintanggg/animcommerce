package service

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/helper"
	"animcommerce/backend/repository"
	"errors"
)

type LoginService interface {
	Login(req dto.LoginRequest) (*dto.LoginResponse, error)
}

type loginService struct {
	repo repository.LoginRepository
}

func NewLoginService(repo repository.LoginRepository) LoginService {
	return &loginService{
		repo: repo,
	}
}

func (s *loginService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email")
	}

	if user.Password != req.Password {
		return nil, errors.New("invalid password")
	}

	token, err := helper.GenerateToken(
		user.ID,
		string(user.Role),
	)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	response := &dto.LoginResponse{
		Token: token,
		User: dto.LoginUserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
			Role:  string(user.Role),
		},
	}

	return response, nil
}
