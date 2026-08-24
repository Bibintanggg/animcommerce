package handler

import (
	"animcommerce/backend/dto"
	"animcommerce/backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginHandler struct {
	Service service.LoginService
}

func NewLoginHandler(
	loginService service.LoginService,
) *LoginHandler {
	return &LoginHandler{
		Service: loginService,
	}
}

func (h *LoginHandler) Login(c *gin.Context) {
	var request dto.LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
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

	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		"access_token",
		response.Token, // sebelumnya result.Token, itu salah
		24*60*60,
		"/",
		"",
		false, // localhost HTTP
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"data":    response,
	})
}
