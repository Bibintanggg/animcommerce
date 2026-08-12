package customer

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
	r.api.POST("/products/:id/reviews", r.reviewHandler.CreateReview)
	r.api.GET("/products/:id/reviews", r.reviewHandler.GetProductReviews)
}
