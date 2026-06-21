package dto

import "animcommerce/backend/models"

type CreateUserRequest struct {
	Name        string              `json:"name" binding:"required"`
	Email       string              `json:"email" binding:"required"`
	Password    string              `json:"password" binding:"required"`
	UserAddress *models.UserAddress `json:"user_address" binding:"required"`
	Role        string              `json:"role" binding:"required"`
}
