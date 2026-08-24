package middleware

import (
	"animcommerce/backend/helper"
	"animcommerce/backend/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		authHeader := c.GetHeader("Authorization")
		parts := strings.Fields(authHeader)

		if len(parts) == 2 &&
			strings.EqualFold(parts[0], "Bearer") {
			tokenString = parts[1]
		}

		// 2. Jika header tidak tersedia, ambil dari cookie.
		if tokenString == "" {
			cookieToken, err := c.Cookie("access_token")
			if err == nil {
				tokenString = cookieToken
			}
		}

		if tokenString == "" {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{
					"message": "Login diperlukan",
				},
			)
			return
		}

		claims, err := helper.ParseToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{
					"message": "Token tidak valid atau sudah kedaluwarsa",
				},
			)
			return
		}

		var user models.User

		if err := db.
			Select("id", "role").
			First(&user, claims.UserID).
			Error; err != nil {

			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				gin.H{
					"message": "Akun sudah tidak tersedia",
				},
			)
			return
		}

		c.Set("user_id", int64(claims.UserID))
		c.Set("role", string(user.Role))

		c.Next()
	}
}
