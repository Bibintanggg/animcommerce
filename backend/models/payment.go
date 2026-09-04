package models

import (
	"animcommerce/backend/models/enum"
	"time"
)

type Payment struct {
	ID                int64              `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID           int64              `gorm:"not null;uniqueIndex" json:"order_id"`
	PaymentMethod     string             `gorm:"type:varchar(30);not null" json:"payment_method"`
	PaymentStatus     enum.PaymentStatus `gorm:"type:varchar(30);not null;default:pending" json:"payment_status"`
	Provider          string             `gorm:"type:varchar(30)" json:"provider"`
	ExternalReference string             `gorm:"type:varchar(100)" json:"external_reference"`
	QRString          string             `gorm:"type:text" json:"qr_string,omitempty"`
	VANumber          string             `gorm:"type:varchar(100)" json:"va_number,omitempty"`
	Amount            int64              `gorm:"not null" json:"amount"`
	ExpiresAt         *time.Time         `json:"expires_at,omitempty"`
	PaidAt            *time.Time         `json:"paid_at,omitempty"`
	QRURL             string             `gorm:"type:text" json:"qr_url,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
