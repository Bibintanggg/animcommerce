package models

import "time"

type FCMDevice struct {
	ID int64 `gorm:"primaryKey" json:"id"`

	UserID int64 `gorm:"not null;index" json:"user_id"`

	InstallationID string `gorm:"type:varchar(255);uniqueIndex;not null" json:"installation_id"`

	UserAgent string `gorm:"type:text" json:"user_agent"`

	LastSeenAt time.Time `gorm:"not null;index" json:"last_seen_at"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
