package config

import (
	"errors"
	"os"
	"strings"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
)

func NewMidtransCoreClient() (*coreapi.Client, error) {
	serverKey := strings.TrimSpace(os.Getenv("MIDTRANS_SERVER_KEY"))

	if serverKey == "" {
		return nil, errors.New("MIDTRANS_SERVER_KEY harus diisi")
	}

	client := &coreapi.Client{}
	client.New(serverKey, midtrans.Sandbox)

	notificationURL := strings.TrimSpace(os.Getenv("MIDTRANS_NOTIFICATION_URL"))
	if notificationURL != "" {
		client.Options.SetPaymentOverrideNotification(notificationURL)
	}

	return client, nil

}
