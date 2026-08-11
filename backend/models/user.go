package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type User struct {
	ID        int64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string        `gorm:"not null" json:"name"`
	Email     string        `gorm:"unique; not null" json:"email"`
	Password  string        `json:"-" gorm:"not null"`
	Role      enum.UserRole `gorm:"default:customer" json:"role"`
	Addresses []UserAddress `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"addresses,omitempty"`
	Wishlists []Wishlist    `json:"wishlists" gorm:"foreignKey:UserID"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}
