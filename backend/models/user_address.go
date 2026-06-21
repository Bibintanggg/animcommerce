package models

import "time"

type UserAddress struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       int64     `gorm:"index" json:"user_id"`
	User         User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ReceiverName string    `gorm:"type:varchar(100)" json:"receiver_name"`
	PhoneNumber  string    `gorm:"type:varchar(20)" json:"phone_number"`
	AddressLine  string    `gorm:"type:text" json:"address_line"`
	City         string    `gorm:"type:varchar(100)" json:"city"`
	PostalCode   string    `gorm:"type:varchar(10)" json:"postal_code"`
	IsDefault    bool      `gorm:"default:false" json:"is_default"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
