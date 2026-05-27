package models

import "time"

type User struct {
	ID         int64  `gorm:"primaryKey; autoIncrement"`
	Name       string `gorm:"not null"`
	Email      string `gorm:"unique; not null"`
	Password   string `gorm:"not null"`
	Role       string `gorm:"default: user"`
	Created_at time.Time
	Updated_at time.Time
}
