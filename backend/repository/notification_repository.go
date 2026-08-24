package repository

import (
	"animcommerce/backend/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

type NotificationRepository interface {
	FindStaffIDs() ([]int64, error)

	CreateForUsers(
		userIDs []int64,
		orderID int64,
		notificationType string,
		title string,
		message string,
	) ([]models.Notification, error)

	FindByUser(
		userID int64,
		page int,
		limit int,
	) ([]models.Notification, int64, int64, error)

	MarkAsRead(notificationID, userID int64) error
	MarkAllAsRead(userID int64) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(
	db *gorm.DB,
) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) FindStaffIDs() (
	[]int64,
	error,
) {
	var userIDs []int64

	err := r.db.
		Model(&models.User{}).
		Where("role IN ?", []string{"admin", "superadmin"}).
		Pluck("id", &userIDs).
		Error

	return userIDs, err
}

func (r *notificationRepository) CreateForUsers(
	userIDs []int64,
	orderID int64,
	notificationType string,
	title string,
	message string,
) ([]models.Notification, error) {
	if len(userIDs) == 0 {
		return []models.Notification{}, nil
	}

	notifications := make(
		[]models.Notification,
		0,
		len(userIDs),
	)

	for _, userID := range userIDs {
		currentOrderID := orderID

		notifications = append(
			notifications,
			models.Notification{
				UserID:  userID,
				OrderID: &currentOrderID,
				Type:    notificationType,
				Title:   title,
				Message: message,
				IsRead:  false,
			},
		)
	}

	err := r.db.Create(&notifications).Error

	return notifications, err
}

func (r *notificationRepository) FindByUser(
	userID int64,
	page int,
	limit int,
) ([]models.Notification, int64, int64, error) {
	var notifications []models.Notification
	var total int64
	var unread int64

	offset := (page - 1) * limit

	query := r.db.
		Model(&models.Notification{}).
		Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, 0, err
	}

	if err := r.db.
		Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&unread).
		Error; err != nil {
		return nil, 0, 0, err
	}

	err := query.
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&notifications).
		Error

	return notifications, total, unread, err
}

func (r *notificationRepository) MarkAsRead(
	notificationID int64,
	userID int64,
) error {
	now := time.Now()

	result := r.db.
		Model(&models.Notification{}).
		Where(
			"id = ? AND user_id = ?",
			notificationID,
			userID,
		).
		Updates(map[string]any{
			"is_read": true,
			"read_at": now,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("notification not found")
	}

	return nil
}

func (r *notificationRepository) MarkAllAsRead(
	userID int64,
) error {
	now := time.Now()

	return r.db.
		Model(&models.Notification{}).
		Where(
			"user_id = ? AND is_read = ?",
			userID,
			false,
		).
		Updates(map[string]any{
			"is_read": true,
			"read_at": now,
		}).
		Error
}
