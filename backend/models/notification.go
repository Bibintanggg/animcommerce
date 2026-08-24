package models

import "time"

type Notification struct {
	ID        int64      `gorm:"primaryKey" json:"id"`
	UserID    int64      `gorm:"not null;index" json:"user_id"`
	OrderID   *int64     `gorm:"index" json:"order_id,omitempty"`
	Type      string     `gorm:"size:50;not null;index" json:"type"`
	Title     string     `gorm:"size:150;not null" json:"title"`
	Message   string     `gorm:"type:text;not null" json:"message"`
	IsRead    bool       `gorm:"default:false;index" json:"is_read"`
	ReadAt    *time.Time `json:"read_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}
