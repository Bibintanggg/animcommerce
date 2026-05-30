package handler

import (
	"animcommerce/backend/models"
	"animcommerce/backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
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
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get users",
		"data":    users,
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {

	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	result, err := h.service.CreateUser(user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed create user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success create user",
		"data":    result,
	})
}
