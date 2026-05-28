package routes

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {

	productHandler := handler.NewProductHandler(db)

	api := r.Group("/api")
	{
		api.GET("/products", productHandler.GetProducts)
		api.GET("/product-details/:slug", productHandler.GetProductDetails)
		api.POST("/products", productHandler.CreateProduct)
		api.PUT("products/:id", productHandler.UpdateProduct)
		api.DELETE("/products/:id", productHandler.DeleteProduct)
	}
}
