package models

import "time"

type Wishlist struct {
	ID        int64 `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    int64 `json:"user_id" gorm:"not null"`
	ProductID int64 `json:"product_id" gorm:"not null"`

	User    User    `json:"user" gorm:"foreignKey:UserID"`
	Product Product `json:"product" gorm:"foreignKey:ProductID"`

	CreatedAt time.Time `json:"created_at"`
}
