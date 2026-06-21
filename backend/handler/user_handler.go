// backend/handler/user_handler.go
package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	service service.UserService
}

func NewUserHandler(service service.UserService) *UserHandler {
	return &UserHandler{
		service: service,
	}
}

func (h *UserHandler) GetAllUser(c *gin.Context) {
	users, err := h.service.GetAllUser()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed get users",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get users",
		"data":    users,
		"total":   len(users),
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	if req.UserAddress != nil {
		if len(req.UserAddress.PostalCode) > 10 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Kode pos maksimal 10 karakter",
			})
			return
		}

		if len(req.UserAddress.PhoneNumber) > 20 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Nomor telepon maksimal 20 karakter",
			})
			return
		}

		if len(req.UserAddress.ReceiverName) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Nama penerima maksimal 100 karakter",
			})
			return
		}

		if len(req.UserAddress.City) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Kota maksimal 100 karakter",
			})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to hash password",
		})
		return
	}

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     enum.UserRole(req.Role),
	}

	var result models.User

	if req.UserAddress != (&models.UserAddress{}) {
		if req.UserAddress.ReceiverName == "" {
			req.UserAddress.ReceiverName = req.Name
		}

		result, err = h.service.CreateUserWithAddress(user, *req.UserAddress)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed create user with address",
				"error":   err.Error(),
			})
			return
		}
	} else {
		result, err = h.service.CreateUser(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed create user",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Success create user",
		"data":    result,
	})
}
