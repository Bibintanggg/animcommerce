package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/service"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
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
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	search := c.Query("search")

	filter := dto.UserFilter{
		Page:   page,
		Limit:  limit,
		Search: search,
	}

	users, total, err := h.service.GetAllUser(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil data pengguna"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": total,
		"page":  page,
		"limit": limit,
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

func (h *UserHandler) UpdateUser(c *gin.Context) {
	var req dto.UpdateUserRequest

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid User ID",
		})
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors := make(map[string]string)
			message := ""
			for _, field := range validationErrors {
				name := strings.ToLower(field.Field())

				var msg string
				switch field.Tag() {
				case "required":
					msg = fmt.Sprintf("%s is required", field.Field())
				case "email":
					msg = "Invalid email format"
				case "min":
					msg = fmt.Sprintf("%s must be at least %s characters", field.Field(), field.Param())
				default:
					msg = "Invalid value"
				}

				errors[name] = msg

				if message == "" {
					message = msg
				}
			}

			c.JSON(http.StatusBadRequest, gin.H{
				"message": message,
				"errors":  errors,
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
		})
		return
	}

	user := models.User{
		Name:  req.Name,
		Email: req.Email,
		Role:  enum.UserRole(req.Role),
	}

	result, err := h.service.UpdateUser(uint(id), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed update user",
			"data":    user,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully updated user",
		"data":    result,
	})
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	err = h.service.DeleteUser(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully deleted user!",
	})

}

func (h *UserHandler) ResetPassword(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid User ID",
		})
		return
	}

	var req dto.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err := h.service.ResetPassword(uint(id), req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully reset Password!",
	})

}

func (h *UserHandler) Me(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "invalid user id",
		})
		return
	}

	user, err := h.service.GetMe(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}
