package handler

import (
	"animcommerce/backend/dto"
	"net/http"

	"animcommerce/backend/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginHandler struct {
	DB      *gorm.DB
	Service service.LoginService
}

func NewLoginHandler(service service.LoginService) *LoginHandler {
	return &LoginHandler{
		Service: service,
	}
}

func (h *LoginHandler) Login(c *gin.Context) {
	var request dto.LoginRequest

	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	response, err := h.Service.Login(request)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success created token",
		"data":    response,
	})
}
