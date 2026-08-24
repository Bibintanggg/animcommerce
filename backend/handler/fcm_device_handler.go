package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

type FCMDeviceHandler struct {
	repository repository.FCMDeviceRepository
}

func NewFCMDeviceHandler(
	repository repository.FCMDeviceRepository,
) *FCMDeviceHandler {
	return &FCMDeviceHandler{
		repository: repository,
	}
}

func (h *FCMDeviceHandler) Register(
	c *gin.Context,
) {
	userID := c.GetInt64("user_id")

	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	var request dto.RegisterFCMDeviceRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Installation ID wajib diisi",
		})
		return
	}

	err := h.repository.Upsert(
		userID,
		request.InstallationID,
		request.UserAgent,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal menyimpan perangkat",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Perangkat berhasil didaftarkan",
	})
}
