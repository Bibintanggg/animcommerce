package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type OrderProduct struct {
	ID             int64  `gorm:"primaryKey;autoIncrement"`
	OrderNumber    string `gorm:"type:varchar(50)"`
	UserID         int64
	User           User `gorm:"foreignKey:UserID"`
	AddressID      int64
	UserAddress    UserAddress `gorm:"foreignKey:AddressID"`
	TotalPrice     int64
	ShippingCost   int64
	StatusOrder    enum.StatusOrder `gorm:"default:pending"`
	StatusShipment enum.ShipmentStatus
	TrackingNumber string `gorm:"type:varchar(100)"`
	Courier        string `gorm:"type:varchar(50)"`
	ShippedAt      *time.Time
	CompletedAt    *time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
