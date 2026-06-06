package handler

import (
	dto "animcommerce/backend/dto/cart"
	"animcommerce/backend/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	service service.CartService
}

func NewCartHandler(service service.CartService) *CartHandler {
	return &CartHandler{
		service: service,
	}
}

func (h *CartHandler) AddToCart(c *gin.Context) {
	var req dto.AddToCartRequest

	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	err = h.service.AddToCart(
		userID.(int64),
		req.ProductID,
		req.Quantity,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success added to cart",
	})
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	items, err := h.service.GetCart(userID.(int64))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get cart",
		"data":    items,
	})
}

func (h *CartHandler) UpdateQuantity(c *gin.Context) {
	var req dto.CartUpdatedRequest

	productID := c.Param("id")

	id, err := strconv.ParseInt(productID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	err = c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	userID, _ := c.Get("user_id")

	err = h.service.UpdateQuantity(
		userID.(int64),
		id,
		req.Quantity,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Quantity updated",
	})
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	productID := c.Param("id")
	userID, _ := c.Get("user_id")

	id, err := strconv.ParseInt(productID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid product id",
		})
		return
	}

	err = h.service.RemoveItem(
		userID.(int64),
		id,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item removed from cart",
	})
}
