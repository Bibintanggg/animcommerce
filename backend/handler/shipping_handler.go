package handler

import (
	"animcommerce/backend/service"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ShippingHandler struct {
	client   *service.RajaOngkirClient
	originID int64
}

type ShippingConfigurationError struct {
	Message string
}

type calculateShippingRequest struct {
	DestinationID int64 `json:"destination_id" binding:"required,gt=0"`
	Weight        int64 `json:"weight" binding:"required,gt=0"`
}

func NewShippingHandler(client *service.RajaOngkirClient) (*ShippingHandler, error) {
	originIDStr := os.Getenv("RAJAONGKIR_ORIGIN_ID")
	originID, err := strconv.ParseInt(originIDStr, 10, 64)
	if err != nil || originID <= 0 {
		return nil, &ShippingConfigurationError{
			Message: "RAJAONGKIR_ORIGIN_ID tidak valid",
		}
	}

	return &ShippingHandler{
		client:   client,
		originID: originID,
	}, nil
}

func (e *ShippingConfigurationError) Error() string {
	return e.Message
}

func (h *ShippingHandler) SearchDestinations(c *gin.Context) {
	search := strings.TrimSpace(c.Query("search"))

	if len(search) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Pencarian lokasi minimal 3 karakter",
		})
		return
	}

	destinations, err := h.client.SearchDestinations(c.Request.Context(), search)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": destinations,
	})
}

func (h *ShippingHandler) CalculateCost(c *gin.Context) {
	var request calculateShippingRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Parameter ongkir tidak valid",
		})
		return
	}

	options, err := h.client.CalculateDomesticCost(c.Request.Context(), service.CalculateShippingInput{
		OriginID:      h.originID,
		DestinationID: request.DestinationID,
		Weight:        request.Weight,
		Couriers:      "jne:sicepat:jnt:tiki:anteraja",
	})

	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": options,
	})

}
