package config

import (
	"context"
	"fmt"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

func NewFirebaseMessagingClient(
	ctx context.Context,
) (*messaging.Client, error) {
	projectID := strings.TrimSpace(
		os.Getenv("FIREBASE_PROJECT_ID"),
	)

	credentialsPath := strings.TrimSpace(
		os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
	)

	if projectID == "" {
		return nil, fmt.Errorf(
			"FIREBASE_PROJECT_ID belum dikonfigurasi",
		)
	}

	if credentialsPath == "" {
		return nil, fmt.Errorf(
			"GOOGLE_APPLICATION_CREDENTIALS belum dikonfigurasi",
		)
	}

	if _, err := os.Stat(credentialsPath); err != nil {
		return nil, fmt.Errorf(
			"file Firebase credential tidak ditemukan di %q: %w",
			credentialsPath,
			err,
		)
	}

	app, err := firebase.NewApp(
		ctx,
		&firebase.Config{
			ProjectID: projectID,
		},
		option.WithCredentialsFile(
			credentialsPath,
		),
	)
	if err != nil {
		return nil, fmt.Errorf(
			"gagal membuat Firebase app: %w",
			err,
		)
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf(
			"gagal membuat Firebase Messaging client: %w",
			err,
		)
	}

	return client, nil
}
