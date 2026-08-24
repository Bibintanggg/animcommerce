package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type OrderProduct struct {
	ID             int64               `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNumber    string              `gorm:"type:varchar(50)" json:"order_number"`
	InvoiceURL     string              `gorm:"type:varchar(255)" json:"-"`
	UserID         int64               `json:"user_id"`
	User           User                `gorm:"foreignKey:UserID" json:"user"`
	AddressID      int64               `json:"address_id"`
	UserAddress    UserAddress         `gorm:"foreignKey:AddressID" json:"address"`
	OrderItem      []OrderItem         `gorm:"foreignKey:OrderID" json:"items"`
	Payment        *Payment            `gorm:"foreignKey:OrderID;references:ID" json:"payment,omitempty"`
	TotalPrice     int64               `json:"total_price"`
	ShippingCost   int64               `json:"shipping_cost"`
	StatusOrder    enum.StatusOrder    `gorm:"default:pending" json:"status_order"`
	StatusShipment enum.ShipmentStatus `json:"status_shipment"`
	TrackingNumber string              `gorm:"type:varchar(100)" json:"tracking_number,omitempty"`
	Courier        string              `gorm:"type:varchar(50)" json:"courier,omitempty"`
	ShippedAt      *time.Time          `json:"shipped_at,omitempty"`
	CompletedAt    *time.Time          `json:"completed_at,omitempty"`
	CreatedAt      time.Time           `json:"created_at"`
	UpdatedAt      time.Time           `json:"updated_at"`
}
