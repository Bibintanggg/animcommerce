package models

type Cart struct {
	ID     int64 `gorm:"primaryKey;autoIncrement"`
	UserID int64
	Items  []CartProduct `gorm:"foreignKey:CartID"`
}
