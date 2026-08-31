package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type OrderStatusHistory struct {
	ID             int64               `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID        int64               `gorm:"not null;index" json:"order_id"`
	Order          OrderProduct        `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	StatusOrder    enum.StatusOrder    `gorm:"type:varchar(30);not null" json:"status_order"`
	StatusShipment enum.ShipmentStatus `gorm:"type:varchar(30);not null" json:"status_shipment"`
	Title          string              `gorm:"type:varchar(100);not null" json:"title"`
	Description    string              `gorm:"type:varchar(255)" json:"description"`
	CreatedAt      time.Time           `json:"created_at"`
}
