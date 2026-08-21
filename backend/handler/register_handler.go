package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/service"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
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
			"message": "Data register tidak valid",
		})
		return
	}

	if err := h.service.Register(req); err != nil {
		if errors.Is(err, service.ErrEmailAlreadyRegistered) {
			c.JSON(http.StatusConflict, gin.H{
				"message": "Email sudah terdaftar",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal membuat akun",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Akun berhasil dibuat",
	})
}
