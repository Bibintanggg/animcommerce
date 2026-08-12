package admin

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type ReviewRoute struct {
	api           *gin.RouterGroup
	reviewHandler *handler.ReviewHandler
}

func NewReviewRoute(
	api *gin.RouterGroup,
	reviewHandler *handler.ReviewHandler,
) *ReviewRoute {
	return &ReviewRoute{
		api:           api,
		reviewHandler: reviewHandler,
	}
}

func (r *ReviewRoute) Register() {
	r.api.GET("/reviews", r.reviewHandler.GetAllReviews)
	r.api.GET("/reviews/summary", r.reviewHandler.GetReviewSummary)
}
