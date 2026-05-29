package handler

import (
	"animcommerce/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		DB: db,
	}
}

func (h *UserHandler) GetAllUser(c *gin.Context) {
	var user []models.User
	err := h.DB.Preload("User").Find(&user).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed get users",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get users",
		"data":    user,
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var user models.User

	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	err = h.DB.Create(&user).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed create product",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success create user",
		"data":    user,
	})
}
