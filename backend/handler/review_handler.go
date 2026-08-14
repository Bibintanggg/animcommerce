package handler

import (
	dto "animcommerce/backend/dto/review"
	"animcommerce/backend/models"
	"animcommerce/backend/service"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService service.ReviewService
}

func NewReviewHandler(
	reviewService service.ReviewService,
) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {

	productID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid product id",
		})
		return
	}

	var req dto.CreateReviewRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	userIDValue, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(int64)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "invalid user id",
		})
		return
	}

	review := &models.Review{
		ProductID: productID,
		UserID:    userID,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	err = h.reviewService.CreateReview(review)

	if errors.Is(err, service.ErrReviewAlreadyExists) {
		c.JSON(http.StatusConflict, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "review created successfully",
		"data":    review,
	})
}

func (h *ReviewHandler) GetProductReviews(c *gin.Context) {

	productID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid product id",
		})
		return
	}

	reviews, err := h.reviewService.GetProductReviews(productID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": reviews,
	})
}

func (h *ReviewHandler) GetReview(c *gin.Context) {

	reviewID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid review id",
		})
		return
	}

	review, err := h.reviewService.GetReview(reviewID)

	if errors.Is(err, service.ErrReviewNotFound) {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "review not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": review,
	})
}

func (h *ReviewHandler) GetAllReviews(c *gin.Context) {

	var filter dto.ReviewFilter

	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	if filter.Page < 1 {
		filter.Page = 1
	}

	if filter.Limit < 1 {
		filter.Limit = 10
	}

	reviews, total, err := h.reviewService.GetAllReviews(filter)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	totalPages := (total + int64(filter.Limit) - 1) /
		int64(filter.Limit)

	c.JSON(http.StatusOK, gin.H{
		"data": reviews,
		"pagination": gin.H{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

func (h *ReviewHandler) GetReviewSummary(c *gin.Context) {

	summary, err := h.reviewService.GetReviewSummary()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": summary,
	})
}

func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid ID",
		})
		return
	}

	var req dto.UpdateReviewRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	userIDValue, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(int64)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "invalid user id",
		})
		return
	}

	review, err := h.reviewService.UpdateReview(
		userID,
		id,
		req.Rating,
		req.Comment,
	)

	if errors.Is(err, service.ErrReviewNotFound) {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "review not found",
		})
		return
	}

	if errors.Is(err, service.ErrUnauthorizedReview) {
		c.JSON(http.StatusForbidden, gin.H{
			"message": err.Error(),
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "review updated successfully",
		"data":    review,
	})
}
