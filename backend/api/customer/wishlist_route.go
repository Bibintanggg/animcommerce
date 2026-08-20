package customer

import (
	"animcommerce/backend/handler"

	"github.com/gin-gonic/gin"
)

type WishlistRoute struct {
	api             *gin.RouterGroup
	wishlistHandler *handler.WishlistHandler
}

func NewWishlistRoute(
	api *gin.RouterGroup,
	wishlistHandler *handler.WishlistHandler,
) *WishlistRoute {
	return &WishlistRoute{
		api:             api,
		wishlistHandler: wishlistHandler,
	}
}

func (r *WishlistRoute) Register() {
	r.api.GET(
		"/wishlists",
		r.wishlistHandler.GetWishlist,
	)

	r.api.POST(
		"/wishlists/:productId",
		r.wishlistHandler.AddWishlist,
	)

	r.api.DELETE(
		"/wishlists/:productId",
		r.wishlistHandler.RemoveWishlist,
	)
}
