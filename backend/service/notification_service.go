package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/realtime"
	"animcommerce/backend/repository"
	"context"
	"fmt"
	"log"
	"time"
)

type NotificationList struct {
	Data   []models.Notification `json:"data"`
	Total  int64                 `json:"total"`
	Unread int64                 `json:"unread"`
	Page   int                   `json:"page"`
	Limit  int                   `json:"limit"`
}

type NotificationService interface {
	NotifyNewOrder(
		orderID int64,
		orderNumber string,
	) error

	GetMyNotifications(
		userID int64,
		page int,
		limit int,
	) (*NotificationList, error)

	MarkAsRead(notificationID, userID int64) error
	MarkAllAsRead(userID int64) error
}

type notificationService struct {
	repository repository.NotificationRepository
	hub        *realtime.NotificationHub
	push       PushNotificationService
}

func NewNotificationService(
	repository repository.NotificationRepository,
	hub *realtime.NotificationHub,
	push PushNotificationService,
) NotificationService {
	return &notificationService{
		repository: repository,
		hub:        hub,
		push:       push,
	}
}

func (s *notificationService) NotifyNewOrder(
	orderID int64,
	orderNumber string,
) error {
	userIDs, err := s.repository.FindStaffIDs()
	if err != nil {
		return err
	}

	title := "Pesanan baru masuk"
	message := fmt.Sprintf(
		"Pesanan %s baru saja dibuat oleh customer.",
		orderNumber,
	)

	notifications, err := s.repository.CreateForUsers(
		userIDs,
		orderID,
		"order.created",
		title,
		message,
	)
	if err != nil {
		return err
	}

	for _, notification := range notifications {
		s.hub.Publish(
			notification.UserID,
			realtime.NotificationEvent{
				ID:        notification.ID,
				OrderID:   notification.OrderID,
				Type:      notification.Type,
				Title:     notification.Title,
				Message:   notification.Message,
				IsRead:    notification.IsRead,
				CreatedAt: notification.CreatedAt,
			},
		)
	}

	go func() {
		ctx, cancel := context.WithTimeout(
			context.Background(),
			10*time.Second,
		)
		defer cancel()

		err := s.push.SendOrderCreated(
			ctx,
			orderID,
			orderNumber,
		)

		if err != nil {
			log.Printf(
				"failed sending FCM notification: %v",
				err,
			)
		}
	}()

	return nil
}

func (s *notificationService) GetMyNotifications(
	userID int64,
	page int,
	limit int,
) (*NotificationList, error) {
	notifications, total, unread, err :=
		s.repository.FindByUser(userID, page, limit)

	if err != nil {
		return nil, err
	}

	return &NotificationList{
		Data:   notifications,
		Total:  total,
		Unread: unread,
		Page:   page,
		Limit:  limit,
	}, nil
}

func (s *notificationService) MarkAsRead(
	notificationID int64,
	userID int64,
) error {
	return s.repository.MarkAsRead(
		notificationID,
		userID,
	)
}

func (s *notificationService) MarkAllAsRead(
	userID int64,
) error {
	return s.repository.MarkAllAsRead(userID)
}
