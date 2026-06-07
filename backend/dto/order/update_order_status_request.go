package order

type UpdateOrderStatusRequest struct {
	StatusOrder    string `json:"status_order"`
	StatusShipment string `json:"status_shipment"`

	Courier        string `json:"courier"`
	TrackingNumber string `json:"tracking_number"`
}
