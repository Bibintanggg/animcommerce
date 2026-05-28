package models

import "time"

type CartProduct struct {
	ID         int64 `gorm:"primaryKey;autoIncrement"`
	UserID     int64
	User       User `gorm:"foreignKey:UserID"`
	ProductID  int64
	Product    Product `gorm:"foreignKey:ProductID"`
	Quantity   int     `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
