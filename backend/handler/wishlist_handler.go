package handler

import (
	"animcommerce/backend/service"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WishlistHandler struct {
	service service.WishlistService
}

func NewWishlistHandler(
	service service.WishlistService,
) *WishlistHandler {
	return &WishlistHandler{
		service: service,
	}
}

func (h *WishlistHandler) GetWishlist(
	c *gin.Context,
) {
	userID, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	wishlists, err := h.service.GetWishlist(
		userID.(int64),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get wishlist",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get wishlist",
		"data":    wishlists,
	})
}

func (h *WishlistHandler) AddWishlist(
	c *gin.Context,
) {
	productID, err := strconv.ParseInt(
		c.Param("productId"),
		10,
		64,
	)

	if err != nil || productID < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid product id",
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

	wishlist, err := h.service.AddWishlist(
		userID.(int64),
		productID,
	)

	if errors.Is(
		err,
		service.ErrWishlistProductNotFound,
	) {
		c.JSON(http.StatusNotFound, gin.H{
			"message": err.Error(),
		})
		return
	}

	if errors.Is(
		err,
		service.ErrWishlistAlreadyExists,
	) {
		c.JSON(http.StatusConflict, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to add wishlist",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Product added to wishlist",
		"data":    wishlist,
	})
}

func (h *WishlistHandler) RemoveWishlist(
	c *gin.Context,
) {
	productID, err := strconv.ParseInt(
		c.Param("productId"),
		10,
		64,
	)

	if err != nil || productID < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid product id",
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

	err = h.service.RemoveWishlist(
		userID.(int64),
		productID,
	)

	if errors.Is(
		err,
		service.ErrWishlistNotFound,
	) {
		c.JSON(http.StatusNotFound, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to remove wishlist",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product removed from wishlist",
	})
}
