package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/helper"
	"animcommerce/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginHandler struct {
	DB *gorm.DB
}

func NewLoginHandler(db *gorm.DB) *LoginHandler {
	return &LoginHandler{
		DB: db,
	}
}

func (h *LoginHandler) Login(c *gin.Context) {
	var user models.User
	var req dto.LoginRequest

	err := c.ShouldBindJSON(&req)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	err = h.DB.Where("email = ?", req.Email).First(&user).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid Email",
		})
		return
	}

	if user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid Password",
		})
		return
	}

	token, err := helper.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed generate token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success created token",
		"data":    token,
	})
}
