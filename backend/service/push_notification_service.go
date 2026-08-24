package service

import (
	"animcommerce/backend/repository"
	"context"
	"fmt"
	"strconv"
	"strings"

	"firebase.google.com/go/v4/messaging"
)

type PushNotificationService interface {
	SendOrderCreated(
		ctx context.Context,
		orderID int64,
		orderNumber string,
	) error
}

type pushNotificationService struct {
	client      *messaging.Client
	deviceRepo  repository.FCMDeviceRepository
	frontendURL string
}

func NewPushNotificationService(
	client *messaging.Client,
	deviceRepo repository.FCMDeviceRepository,
	frontendURL string,
) PushNotificationService {
	return &pushNotificationService{
		client:     client,
		deviceRepo: deviceRepo,
		frontendURL: strings.TrimRight(
			frontendURL,
			"/",
		),
	}
}

func (
	s *pushNotificationService,
) SendOrderCreated(
	ctx context.Context,
	orderID int64,
	orderNumber string,
) error {
	installationIDs, err :=
		s.deviceRepo.FindStaffInstallationIDs()

	if err != nil {
		return err
	}

	if len(installationIDs) == 0 {
		return nil
	}

	orderIDString :=
		strconv.FormatInt(orderID, 10)

	title := "Pesanan baru masuk"

	body := fmt.Sprintf(
		"Pesanan %s baru saja dibuat.",
		orderNumber,
	)

	message := &messaging.MulticastMessage{
		Fids: installationIDs,

		Data: map[string]string{
			"type":         "order.created",
			"order_id":     orderIDString,
			"order_number": orderNumber,
			"title":        title,
			"body":         body,
			"url":          "/admin/orders/" + orderIDString,
		},

		// Webpush: &messaging.WebpushConfig{
		// 	Notification: &messaging.WebpushNotification{
		// 		Title: title,
		// 		Body:  body,

		// 		Icon: s.frontendURL +
		// 			"/icons/icon-192.png",

		// 		Badge: s.frontendURL +
		// 			"/icons/badge-72.png",

		// 		Tag: "order-" +
		// 			orderIDString,
		// 	},

		// 	FCMOptions: &messaging.WebpushFCMOptions{
		// 		Link: s.frontendURL +
		// 			"/admin/orders/" +
		// 			orderIDString,
		// 	},
		// },

		Webpush: &messaging.WebpushConfig{
			Headers: map[string]string{
				"Urgency": "high",
			},
		},
	}

	response, err :=
		s.client.SendEachForMulticast(
			ctx,
			message,
		)

	if err != nil {
		return err
	}

	// Hapus FID yang sudah tidak berlaku.
	for index, result := range response.Responses {

		if result.Success {
			continue
		}

		if messaging.IsUnregistered(
			result.Error,
		) {
			_ = s.deviceRepo.
				DeleteByInstallationID(
					installationIDs[index],
				)
		}
	}

	return nil
}
