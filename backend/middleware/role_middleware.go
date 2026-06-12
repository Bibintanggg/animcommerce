package middleware

import (
	"animcommerce/backend/models/enum"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RoleMiddleware(roles ...enum.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			return
		}

		role := enum.UserRole(userRole.(string))

		for _, allowedRole := range roles {
			if role == allowedRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"message": "Forbidden",
		})
	}
}
