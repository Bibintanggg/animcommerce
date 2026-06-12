package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RegisterHandler struct {
	service service.RegisterService
}

func NewRegisterHandler(
	service service.RegisterService,
) *RegisterHandler {
	return &RegisterHandler{
		service: service,
	}
}

func (h *RegisterHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	err := h.service.Register(req)

	if err == gorm.ErrDuplicatedKey {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email already exists",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Register success",
	})
}
