package main

import (
	"animcommerce/backend/config"
	"animcommerce/backend/database"
	"animcommerce/backend/handler"
	"animcommerce/backend/helper"
	"animcommerce/backend/repository"
	"animcommerce/backend/routes"
	"animcommerce/backend/scheduler"
	"animcommerce/backend/service"
	"context"
	"log"
	"os"
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

	firebaseMessagingClient, err :=
		config.NewFirebaseMessagingClient(
			context.Background(),
		)

	if err != nil {
		log.Fatalf(
			"failed to initialize Firebase: %v",
			err,
		)
	}

	fcmDeviceRepository :=
		repository.NewFCMDeviceRepository(db)

	midtransClient, err := config.NewMidtransCoreClient()
	if err != nil {
		log.Fatalf("Failed to initialize Midtrans: %v", err)
	}

	paymentGateway := service.NewMidtransPaymentGateway(midtransClient)

	pushNotificationService :=
		service.NewPushNotificationService(
			firebaseMessagingClient,
			fcmDeviceRepository,
			os.Getenv("FRONTEND_URL"),
		)

	fcmDeviceHandler :=
		handler.NewFCMDeviceHandler(
			fcmDeviceRepository,
		)

	orderService := routes.SetupRoutes(
		r,
		db,
		cld,
		pushNotificationService,
		fcmDeviceHandler,
		paymentGateway,
	)

	// orderService := routes.SetupRoutes(
	// 	r, db, cld, pushNotificationService, fcmDeviceHandler,
	// )

	expiryScheduler, err := scheduler.NewOrderExpiryScheduler(
		orderService,
		1*time.Minute,
		100,
	)

	if err != nil {
		log.Fatalf("failed to initialize order expiry scheduler: %v", err)
	}

	schedulerContext, stopScheduler := context.WithCancel(context.Background())
	defer stopScheduler()

	go expiryScheduler.Run(schedulerContext)

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
