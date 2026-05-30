package models

import "time"

type CartProduct struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	CartID    int64
	Cart      Cart `gorm:"foreignKey:CartID"`
	ProductID int64
	Product   Product `gorm:"foreignKey:ProductID"`
	Quantity  int     `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
