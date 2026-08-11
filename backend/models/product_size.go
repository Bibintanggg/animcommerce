package models

import "time"

type ProductSize struct {
	ID        int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	ProductID int64     `json:"product_id"`
	Size      string    `json:"size" gorm:"type:varchar(20);not null"`
	Product   Product   `json:"-" gorm:"foreignKey:ProductID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
