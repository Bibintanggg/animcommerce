package models

import "time"

type UserAddress struct {
	ID           int64 `gorm:"primaryKey;autoIncrement"`
	UserID       int64
	User         User   `gorm:"foreignKey:UserID"`
	ReceiverName string `gorm:"type:varchar(100)"`
	PhoneNumber  string `gorm:"type:varchar(20)"`
	AddressLine  string `gorm:"type:text"`
	City         string `gorm:"type:varchar(100)"`
	PostalCode   string `gorm:"type:varchar(10)"`
	IsDefault    bool   `gorm:"default:false"`
	Created_at   time.Time
	Updated_at   time.Time
}
