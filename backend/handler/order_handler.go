package handler

import (
	dto "animcommerce/backend/dto/order"
	"animcommerce/backend/models"
	"animcommerce/backend/service"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service             service.OrderService
	notificationService service.NotificationService
}

func NewOrderHandler(service service.OrderService, notificationService service.NotificationService) *OrderHandler {
	return &OrderHandler{
		service:             service,
		notificationService: notificationService,
	}
}

func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
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
		"message":     "Success get orders",
		"data":        orders,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
	})
}

func (h *OrderHandler) CheckoutCart(c *gin.Context) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid user",
		})
		return
	}

	var request dto.CheckoutRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data checkout tidak valid",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.CheckoutCart(userID, request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err := h.notificationService.NotifyNewOrder(
		result.OrderID,
		result.OrderNumber,
	); err != nil {
		// Jangan mengubah checkout menjadi gagal karena notifikasi gagal.
		log.Printf(
			"failed to create order notification: %v",
			err,
		)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Checkout berhasil",
		"data":    result,
	})
}

func (h *OrderHandler) CheckoutProduct(c *gin.Context) {
	slug := c.Param("slug")

	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Slug produk wajib diisi",
		})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Silakan login terlebih dahulu",
		})
		return
	}

	userID, ok := userIDValue.(int64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Data pengguna tidak valid",
		})
		return
	}

	var request dto.CheckoutProductRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data checkout tidak valid",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.service.CheckoutProduct(
		userID,
		slug,
		request,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err := h.notificationService.NotifyNewOrder(
		result.OrderID,
		result.OrderNumber,
	); err != nil {
		log.Printf(
			"failed to create order notification: %v",
			err,
		)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Checkout berhasil",
		"data":    result,
	})
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
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
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	order, err := h.service.GetOrderDetail(
		userID.(int64),
		id,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Order not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get order detail",
		"data":    order,
	})
}

func (h *OrderHandler) GetAdminOrderDetail(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	order, err := h.service.GetAdminOrderDetail(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Success get order detail",
		"data":    order,
	})
}

func (h *OrderHandler) GetMyInvoice(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	order, err := h.service.GetOrderDetail(userID.(int64), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Invoice not found"})
		return
	}

	h.serveInvoice(c, order)
}

func (h *OrderHandler) GetAdminInvoice(c *gin.Context) {
	id, ok := parseOrderID(c)
	if !ok {
		return
	}

	order, err := h.service.GetAdminOrderDetail(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Invoice not found"})
		return
	}

	h.serveInvoice(c, order)
}

func parseOrderID(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid order id"})
		return 0, false
	}
	return id, true
}

func (h *OrderHandler) serveInvoice(c *gin.Context, order *models.OrderProduct) {
	if order.InvoiceURL == "" {
		c.JSON(http.StatusNotFound, gin.H{"message": "Invoice is not ready"})
		return
	}

	baseDir, err := filepath.Abs(filepath.Join("storage", "invoices"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to read invoice"})
		return
	}
	invoicePath, err := filepath.Abs(filepath.Clean(order.InvoiceURL))
	if err != nil || !strings.HasPrefix(invoicePath, baseDir+string(os.PathSeparator)) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Invoice not found"})
		return
	}
	info, err := os.Stat(invoicePath)
	if err != nil || !info.Mode().IsRegular() {
		c.JSON(http.StatusNotFound, gin.H{"message": "Invoice not found"})
		return
	}

	c.Header("Cache-Control", "private, no-store")
	c.FileAttachment(invoicePath, fmt.Sprintf("invoice_%s.pdf", order.OrderNumber))
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
