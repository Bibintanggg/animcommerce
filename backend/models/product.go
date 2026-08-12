package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type Product struct {
	ID          int64 `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID      int64
	User        User   `gorm:"foreignKey:UserID"`
	Title       string `json:"title" gorm:"type:varchar(255);not null"`
	Thumbnail   string `json:"thumbnail" gorm:"not null"`
	Slug        string `json:"slug" gorm:"unique;not null"`
	Description string `json:"description" gorm:"type:text"`
	Price       int    `json:"price" gorm:"not null"`
	Stock       int    `json:"stock" gorm:"not null;default:0"`
	IsFeatured  bool   `json:"is_featured" gorm:"default:false"`

	IsActive enum.ProductStatus   `json:"is_active" gorm:"default:draft"`
	Category enum.ProductCategory `json:"category" gorm:"default:tshirt"`
	Sold     int                  `json:"sold" gorm:"default:0"`

	Reviews []Review      `json:"reviews" gorm:"foreignKey:ProductID"`
	Size    []ProductSize `json:"size" gorm:"foreignKey:ProductID"`

	Wishlists []Wishlist `json:"wishlists" gorm:"foreignKey:ProductID"`

	Discounts []Discount `json:"discounts" gorm:"foreignKey:ProductID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
