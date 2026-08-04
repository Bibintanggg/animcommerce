package handler

import (
	dto "animcommerce/backend/dto/products"
	"animcommerce/backend/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	service service.ProductService
}

func NewProductHandler(service service.ProductService) *ProductHandler {
	return &ProductHandler{
		service: service,
	}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {

	products, err := h.service.GetProducts()

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
	products, err := h.service.GetProductDetails(slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get product",
		"data":    products,
	})
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest

	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	file, err := c.FormFile("thumbnail")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Thumbnail is required",
		})
		return
	}

	userID, _ := c.Get("user_id")

	product, err := h.service.CreateProduct(
		userID.(int64),
		req,
		file,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Success created product",
		"data":    product,
	})
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idParam := c.Param("id")

	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid ID format. ID must be a number",
		})
		return
	}

	var request dto.UpdateProductRequest

	err = c.ShouldBind(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	products, err := h.service.UpdateProduct(id, request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed updated product",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success updated product",
		"data":    products,
	})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idParam := c.Param("id")

	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid ID format. ID must be a number",
		})
	}

	err = h.service.DeleteProduct(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success delete product",
	})
}
