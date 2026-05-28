package handler

import (
	"animcommerce/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductHandler struct {
	DB *gorm.DB
}

func NewProductHandler(db *gorm.DB) *ProductHandler {
	return &ProductHandler{
		DB: db,
	}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	err := h.DB.Preload("User").Find(&products).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed get products",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get products",
		"data":    products,
	})
}

func (h *ProductHandler) GetProductDetails(c *gin.Context) {
	slug := c.Param("slug")

	var product models.Product

	err := h.DB.Preload("User").Where("slug = ?", slug).First(&product).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get product",
		"data":    product,
	})
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var product models.Product

	err := c.ShouldBindJSON(&product)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
	}

	err = h.DB.Create(&product).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed create product",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Success create product",
		"data":    product,
	})

}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product

	err := h.DB.First(&product, id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Product not found",
		})

		return
	}

	err = c.ShouldBindJSON(&product)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	h.DB.Save(&product)

	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated",
		"data":    product,
	})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product

	err := h.DB.First(&product, id).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Product not found",
		})
		return
	}

	h.DB.Delete(&product)

	c.JSON(http.StatusOK, gin.H{
		"message": "Success product deleted",
	})
}
