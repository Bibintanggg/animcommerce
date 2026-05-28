package models

import "time"

type OrderItem struct {
	ID         int64 `gorm:"primaryKey;autoIncrement"`
	OrderID    int64
	ProductID  int64
	Product    Product `gorm:"foreignKey:ProductID"`
	Quantity   int64
	Price      int64
	CreatedAt time.Time
	UpdatedAt time.Time
}
