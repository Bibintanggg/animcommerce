package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type StockMovement struct {
	ID          int64                  `gorm:"primaryKey" json:"id"`
	ProductID   int64                  `gorm:"not null;index" json:"product_id"`
	Type        enum.StockMovementType `gorm:"not null" json:"type"`
	Quantity    int                    `gorm:"not null" json:"quantity"`
	StockBefore int                    `gorm:"not null" json:"stock_before"`
	StockAfter  int                    `gorm:"not null" json:"stock_after"`
	CreatedAt   time.Time              `json:"created_at"`

	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}
