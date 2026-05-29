package main

import (
	"animcommerce/backend/config"
	"animcommerce/backend/database"
	"animcommerce/backend/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	db := config.ConnectDB()
	database.MigrateDB(db)

	err := godotenv.Load("../.env")
	if err != nil {
		panic("Cannot load env")
	}

	r := gin.Default()

	routes.SetupRoutes(r, db)

	r.Run(":8080")
}
