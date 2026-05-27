package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type Product struct {
	ID          int64 `gorm:"primaryKey;autoIncrement"`
	UserID      int64
	User        User                 `gorm:"foreignKey:UserID"`
	Title       string               `gorm:"type:varchar(255);not null"`
	Thumbnail   string               `gorm:"not null"`
	Slug        string               `gorm:"unique;not null"`
	Description string               `gorm:"type:text"`
	Price       int                  `gorm:"not null"`
	Stock       int                  `gorm:"not null;default:0"`
	IsActive    enum.ProductStatus   `gorm:"default:draft"`
	Category    enum.ProductCategory `gorm:"default:tshirt"`
	Created_at  time.Time
	Updated_at  time.Time
}
