package handler

import (
	dto "animcommerce/backend/dto/order"
	"animcommerce/backend/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderHandler(service service.OrderService) *OrderHandler {
	return &OrderHandler{
		service: service,
	}
}

func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")

	filter := dto.OrderFilter{
		Page:   page,
		Limit:  limit,
		Search: search,
	}

	orders, total, err := h.service.GetAllOrders(filter)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed get orders",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get orders",
		"data":    orders,
		"total":   total,
	})
}
func (h *OrderHandler) Checkout(c *gin.Context) {
	var req dto.CheckoutRequest

	if err := c.ShouldBindJSON(&req); err != nil {
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

	err := h.service.Checkout(
		userID.(int64),
		req,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Checkout success",
	})
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
	}

	orders, err := h.service.GetMyOrders(
		userID.(int64),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get orders",
		"data":    orders,
	})
}

func (h *OrderHandler) GetOrderDetail(c *gin.Context) {
	orderID := c.Param("id")
	id, err := strconv.ParseInt(orderID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid order id",
		})
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": err.Error(),
		})
		return
	}

	order, err := h.service.GetOrderDetail(
		userID.(int64),
		id,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get order detail",
		"data":    order,
	})
}

func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	var req dto.UpdateOrderStatusRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	orderID := c.Param("id")
	id, err := strconv.ParseInt(orderID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid order id",
		})
		return
	}

	err = h.service.UpdateOrderStatus(
		id,
		req,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success update status order",
	})
}
