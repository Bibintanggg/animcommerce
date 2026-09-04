package routes

import (
	"animcommerce/backend/api/admin"
	"animcommerce/backend/api/customer"
	"animcommerce/backend/api/public"
	"animcommerce/backend/api/superadmin"
	"animcommerce/backend/handler"
	"animcommerce/backend/middleware"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/realtime"
	"animcommerce/backend/repository"
	"animcommerce/backend/service"
	"animcommerce/backend/storage/images"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB, cld *cloudinary.Cloudinary, pushNotificationService service.PushNotificationService,
	fcmDeviceHandler *handler.FCMDeviceHandler) service.OrderService {
	storage := images.NewCloudinaryStorage(cld)

	loginRepository := repository.NewLoginRepository(db)
	loginService := service.NewLoginService(loginRepository)
	loginHandler := handler.NewLoginHandler(loginService)

	registerRepository := repository.NewRegisterRepository(db)
	registerService := service.NewRegisterService(registerRepository)
	registerHandler := handler.NewRegisterHandler(registerService)

	productRepository := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepository, storage)
	productHandler := handler.NewProductHandler(productService)

	reviewRepository := repository.NewReviewRepository(db)
	reviewService := service.NewReviewService(reviewRepository)
	reviewHandler := handler.NewReviewHandler(reviewService)

	userRepository := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepository)
	userHandler := handler.NewUserHandler(userService)
	dashboardHandler := handler.NewDashboardHandler(userService)

	cartRepository := repository.NewCartRepository(db)
	cartService := service.NewCartService(
		cartRepository,
		productRepository,
	)
	cartHandler := handler.NewCartHandler(cartService)

	wishlistRepository := repository.NewWishlistRepository(db)
	wishlistService := service.NewWishlistService(wishlistRepository, productRepository)
	wishlistHandler := handler.NewWishlistHandler(wishlistService)

	notificationHub := realtime.NewNotificationHub()
	notificationRepository := repository.NewNotificationRepository(db)
	notificationService :=
		service.NewNotificationService(
			notificationRepository,
			notificationHub,
			pushNotificationService,
		)

	notificationHandler :=
		handler.NewNotificationHandler(
			notificationService,
			notificationHub,
		)

	orderRepository := repository.NewOrderRepository(db)
	invoiceService := service.NewInvoiceService(orderRepository, db)
	orderItemRepository := repository.NewOrderItemRepository(db)
	cartProductRepository := repository.NewCartProductRepository(db)
	addressRepository := repository.NewUserAddressRepository(db)
	orderService := service.NewOrderService(
		db,
		orderRepository,
		orderItemRepository,
		cartRepository,
		cartProductRepository,
		productRepository,
		addressRepository,
		invoiceService,
	)
	orderHandler := handler.NewOrderHandler(orderService, notificationService)

	api := r.Group("/api")
	{
		publicAPI := api.Group("")
		publicAPI.Use(middleware.RateLimit(10, 1*time.Minute))
		publicRoute := public.NewPublicRoute(publicAPI, loginHandler, registerHandler)
		publicRoute.RegisterLoginRoute()

		productRoute := customer.NewProductRoute(api, productHandler)
		productRoute.Register()

		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware(db))
		auth.GET("/me", userHandler.Me)

		reviewRoute := customer.NewReviewRoute(api, auth, reviewHandler)
		reviewRoute.Register()

		{
			cartRoute := customer.NewCartRoute(auth, cartHandler)
			cartRoute.Register()

			wishlistRoute := customer.NewWishlistRoute(auth, wishlistHandler)
			wishlistRoute.Register()

			orderRoute := customer.NewOrdersRoute(auth, orderHandler)
			orderRoute.Register()

			adminGroup := api.Group("/admin")
			adminGroup.Use(
				middleware.AuthMiddleware(db),
				middleware.RoleMiddleware(
					enum.AdminRole,
					enum.SuperRole,
				),
			)

			admin.NewReviewRoute(adminGroup, reviewHandler).Register()
			admin.NewProductRoute(adminGroup, productHandler).Register()
			admin.NewOrderRoute(adminGroup, orderHandler).Register()

			notificationRoute := admin.NewNotificationRoute(adminGroup, notificationHandler, fcmDeviceHandler)

			notificationRoute.Register()

			superadminGroup := api.Group("/superadmin")
			superadminGroup.Use(
				middleware.AuthMiddleware(db),
				middleware.RoleMiddleware(
					enum.SuperRole,
				),
			)
			superadmin.NewUserRoute(superadminGroup, userHandler).Register()
			superadmin.NewDashboardRoute(superadminGroup, dashboardHandler).Register()
		}
	}

	return orderService
}
