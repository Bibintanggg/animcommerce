package models

import "time"

type Review struct {
	ID        int64 `json:"id" gorm:"primaryKey;autoIncrement"`
	ProductID int64 `json:"product_id"`
	UserID    int64 `json:"user_id"`

	Rating  int    `json:"rating" gorm:"not null"`
	Comment string `json:"comment" gorm:"type:text"`

	Product Product `json:"-" gorm:"foreignKey:ProductID"`
	User    User    `json:"user" gorm:"foreignKey:UserID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
