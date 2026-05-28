package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type Payment struct {
	ID            int64  `gorm:"primaryKey;autoIncrement"`
	OrderID       int64  `gorm:"unique"`
	PaymentMethod string `gorm:"varchar(30)"`
	Amount        int64
	PaymentStatus enum.PaymentStatus `gorm:"default:pending"`
	Created_at    time.Time
	Updated_at    time.Time
}
