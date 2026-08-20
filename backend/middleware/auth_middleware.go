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
		authHeader := c.GetHeader("Authorization")

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			c.Abort()
			return
		}

		claims, err := helper.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		var user models.User
		if err := db.Select("id", "role").First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Account is no longer available",
			})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", string(user.Role))
		c.Next()
	}
}
