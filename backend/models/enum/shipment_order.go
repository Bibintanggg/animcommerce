package enum

type ShipmentStatus string

const (
	ShipmentAwaitingPickup ShipmentStatus = "awaiting-pickup"
	ShipmentInTransit      ShipmentStatus = "transit"
	ShipmentDelivered      ShipmentStatus = "delivered"
)
