package middleware

import (
	"animcommerce/backend/helper"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		token, err := jwt.ParseWithClaims(
			tokenString,
			&helper.JWTClaim{},
			func(t *jwt.Token) (interface{}, error) {
				return helper.SECRET_KEY, nil
			},
		)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*helper.JWTClaim)

		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
