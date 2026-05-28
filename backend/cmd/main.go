package main

import (
	"animcommerce/backend/config"
	"animcommerce/backend/database"
	"animcommerce/backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	db := config.ConnectDB()
	database.MigrateDB(db)

	r := gin.Default()

	routes.SetupRoutes(r, db)

	r.Run(":8080")
}
