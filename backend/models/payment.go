package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type Payment struct {
	ID            int64              `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID       int64              `gorm:"not null;uniqueIndex" json:"order_id"`
	PaymentMethod string             `gorm:"type:varchar(30);not null" json:"payment_method"`
	Amount        int64              `gorm:"not null" json:"amount"`
	PaymentStatus enum.PaymentStatus `gorm:"type:varchar(30);not null;default:pending" json:"payment_status"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
}
