package models

import "time"

type UserAddress struct {
	ID           int64     `gorm:"primaryKey" json:"id"`
	UserID       int64     `gorm:"not null;index" json:"user_id"`
	ReceiverName string    `gorm:"size:100;not null" json:"receiver_name"`
	PhoneNumber  string    `gorm:"size:20;not null" json:"phone_number"`
	AddressLine  string    `gorm:"type:text;not null" json:"address_line"`
	Province     string    `gorm:"size:100;not null" json:"province"`
	City         string    `gorm:"size:100;not null" json:"city"`
	District     string    `gorm:"size:100;not null" json:"district"`
	PostalCode   string    `gorm:"size:10;not null" json:"postal_code"`
	IsDefault    bool      `gorm:"default:false" json:"is_default"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
