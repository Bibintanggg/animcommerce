package models

import "time"

type OrderItem struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   int64     `json:"order_id"`
	ProductID int64     `json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int64     `json:"quantity"`
	Price     int64     `json:"price"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
