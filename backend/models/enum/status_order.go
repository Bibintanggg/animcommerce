package enum

type StatusOrder string

const (
	StatusDelivered      StatusOrder = "delivered"
	StatusInTransit      StatusOrder = "transit"
	StatusAwaitingPickup StatusOrder = "awaiting-pickup"
	StatusProcessing     StatusOrder = "processing"
	StatusPending        StatusOrder = "pending"
)
