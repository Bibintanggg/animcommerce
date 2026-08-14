package customer

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type ReviewRoute struct {
	publicAPI     *gin.RouterGroup
	api           *gin.RouterGroup
	reviewHandler *handler.ReviewHandler
}

func NewReviewRoute(
	publicAPI *gin.RouterGroup,
	api *gin.RouterGroup,
	reviewHandler *handler.ReviewHandler,
) *ReviewRoute {
	return &ReviewRoute{
		publicAPI:     publicAPI,
		api:           api,
		reviewHandler: reviewHandler,
	}
}

func (r *ReviewRoute) Register() {
	r.publicAPI.GET("/products/:id/reviews", r.reviewHandler.GetProductReviews)
	r.api.POST("/products/:id/reviews", r.reviewHandler.CreateReview)
	r.api.PUT("/reviews/:id", r.reviewHandler.UpdateReview)
}
