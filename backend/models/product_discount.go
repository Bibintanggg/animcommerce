package models

import "time"

type Discount struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	Code  string `json:"code" gorm:"unique;not null"`
	Type  string `json:"type" gorm:"type:varchar(20);not null"`
	Value int    `json:"value" gorm:"not null"`

	MinPurchase int `json:"min_purchase" gorm:"default:0"`
	MaxDiscount int `json:"max_discount" gorm:"default:0"`

	UsageLimit int `json:"usage_limit" gorm:"default:0"`
	UsedCount  int `json:"used_count" gorm:"default:0"`

	StartAt *time.Time `json:"start_at"`
	EndAt   *time.Time `json:"end_at"`

	IsActive bool `json:"is_active" gorm:"default:true"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
