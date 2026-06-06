package routes

import (
	"animcommerce/backend/handler"
	"animcommerce/backend/middleware"
	"animcommerce/backend/repository"
	"animcommerce/backend/service"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {

	loginRepository := repository.NewLoginRepository(db)
	loginService := service.NewLoginService(loginRepository)
	loginHandler := handler.NewLoginHandler(loginService)

	productRepository := repository.NewProductRepository(db)
	productService := service.NewProductService(productRepository)
	productHandler := handler.NewProductHandler(productService)

	userRepository := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepository)
	userHandler := handler.NewUserHandler(userService)

	cartRepository := repository.NewCartRepository(db)
	cartService := service.NewCartService(
		cartRepository,
		productRepository,
	)
	cartHandler := handler.NewCartHandler(cartService)

	api := r.Group("/api")
	{
		api.POST("/login", loginHandler.Login)

		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/products", productHandler.GetProducts)
			auth.GET("/product-details/:slug", productHandler.GetProductDetails)
			auth.POST("/products", productHandler.CreateProduct)
			auth.PUT("/products/:id", productHandler.UpdateProduct)
			auth.DELETE("/products/:id", productHandler.DeleteProduct)

			auth.GET("/users", userHandler.GetAllUser)
			auth.POST("/users", userHandler.CreateUser)

			auth.GET("/cart", cartHandler.GetCart)
			auth.POST("/cart", cartHandler.AddToCart)
			auth.PUT("/cart/:id", cartHandler.UpdateQuantity)
			auth.DELETE("/cart/:id", cartHandler.RemoveItem)
		}
	}
}
