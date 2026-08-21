package main

import (
	"animcommerce/backend/config"
	"animcommerce/backend/database"
	"animcommerce/backend/helper"
	"animcommerce/backend/routes"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../.env", ".env")

	if err := helper.ValidateJWTConfig(); err != nil {
		log.Fatal(err)
	}

	db := config.ConnectDB()
	database.MigrateDB(db)

	log.Println("Database migration berhasil")

	cld := config.NewCloudinaryClient()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.SetupRoutes(r, db, cld)

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
