package main

import (
	"animcommerce/backend/config"
	"animcommerce/backend/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDB()
	database.MigrateDB()

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "API Start",
		})
	})
}
