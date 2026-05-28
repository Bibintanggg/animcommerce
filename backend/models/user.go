package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type User struct {
	ID          int64         `gorm:"primaryKey;autoIncrement"`
	Name        string        `gorm:"not null"`
	Email       string        `gorm:"unique; not null"`
	Password    string        `gorm:"not null"`
	Role        enum.UserRole `gorm:"default:customer"`
	UserAddress string        `gorm:"not null"`
	Created_at  time.Time
	Updated_at  time.Time
}
