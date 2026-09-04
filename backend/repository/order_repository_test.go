package repository

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"context"
	"fmt"
	"testing"
	"time"
)

func TestFindExpiredPendingOrderIDs(t *testing.T) {
	db := openTestDB(t)

	err := db.
		Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(
			&models.User{},
			&models.UserAddress{},
			&models.OrderProduct{},
			&models.Payment{},
		)

	if err != nil {
		t.Fatalf("Gagal menyiapkan tabel testing: %v", err)
	}

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Gagal memulai transaction: %v", tx.Error)
	}

	t.Cleanup(func() {
		if err := tx.Rollback().Error; err != nil {
			t.Errorf("Gagal melakukan rollback fixture: %v", err)
		}
	})

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	now := time.Now()

	user := models.User{
		Name:     "Finder Expiry User",
		Email:    "finder-expiry-" + suffix + "@example.invalid",
		Password: "fixture-only-not-for-login",
		Role:     enum.AdminRole,
	}

	if err := tx.Create(&user).Error; err != nil {
		t.Fatalf("Gagal membuat user fixture: %v", err)
	}

	address := models.UserAddress{
		UserID:       user.ID,
		ReceiverName: "Penerima Finder",
		PhoneNumber:  "081234567890",
		AddressLine:  "Jalan Finder Expiry Nomor 1",
		Province:     "DKI Jakarta",
		City:         "Jakarta Timur",
		District:     "Duren Sawit",
		PostalCode:   "13440",
		IsDefault:    false,
	}

	if err := tx.Create(&address).Error; err != nil {
		t.Fatalf("Gagal membuat alamat fixture: %v", err)
	}

	orderSequence := 0

	createOrder := func(
		statusOrder enum.StatusOrder,
		provider string,
		paymentStatus enum.PaymentStatus,
		expiresAt *time.Time,
		paidAt *time.Time,
	) int64 {
		t.Helper()

		orderSequence++

		order := models.OrderProduct{
			OrderNumber: fmt.Sprintf(
				"FIND-%d-%s",
				orderSequence,
				suffix,
			),
			UserID:         user.ID,
			AddressID:      address.ID,
			TotalPrice:     100_000,
			ShippingCost:   25_000,
			StatusOrder:    statusOrder,
			StatusShipment: enum.ShipmentAwaitingPickup,
			Courier:        "",
			TrackingNumber: "",
		}

		if err := tx.Create(&order).Error; err != nil {
			t.Fatalf("Gagal membuat order fixture: %v", err)
		}

		payment := models.Payment{
			OrderID:           order.ID,
			PaymentMethod:     "qris",
			PaymentStatus:     paymentStatus,
			Provider:          provider,
			ExternalReference: "FINDER-" + order.OrderNumber,
			QRString:          "FINDER-TEST-QR",
			Amount:            125_000,
			ExpiresAt:         expiresAt,
			PaidAt:            paidAt,
		}

		if err := tx.Create(&payment).Error; err != nil {
			t.Fatalf("Gagal membuat payment fixture: %v", err)
		}

		return order.ID
	}

	olderExpiry := now.Add(-2 * time.Hour)
	newerExpiry := now.Add(-1 * time.Hour)
	futureExpiry := now.Add(1 * time.Hour)
	paidAt := now.Add(-30 * time.Minute)

	// Dua order ini harus ditemukan.
	olderOrderID := createOrder(
		enum.OrderPending,
		"dummy",
		enum.PaymentPending,
		&olderExpiry,
		nil,
	)

	newerOrderID := createOrder(
		enum.OrderPending,
		"dummy",
		enum.PaymentPending,
		&newerExpiry,
		nil,
	)

	// Belum melewati expires_at.
	createOrder(
		enum.OrderPending,
		"dummy",
		enum.PaymentPending,
		&futureExpiry,
		nil,
	)

	// Sudah dibayar.
	createOrder(
		enum.OrderPending,
		"dummy",
		enum.PaymentSuccess,
		&olderExpiry,
		&paidAt,
	)

	// Provider bukan dummy.
	createOrder(
		enum.OrderPending,
		"midtrans",
		enum.PaymentPending,
		&olderExpiry,
		nil,
	)

	// Order sudah cancelled.
	createOrder(
		enum.OrderCancelled,
		"dummy",
		enum.PaymentPending,
		&olderExpiry,
		nil,
	)

	// Tidak memiliki waktu expiry.
	createOrder(
		enum.OrderPending,
		"dummy",
		enum.PaymentPending,
		nil,
		nil,
	)

	repository := NewOrderRepository(tx)

	// Limit 1 harus mengembalikan expiry yang paling lama.
	firstBatch, err := repository.FindExpiredPendingOrderIDs(context.Background(), now, 1)
	if err != nil {
		t.Fatalf("Finder limit 1 gagal: %v", err)
	}

	if len(firstBatch) != 1 {
		t.Fatalf("Limit 1 seharusnya menghasilkan 1 order, mendapat %d", len(firstBatch))
	}

	if firstBatch[0] != olderOrderID {
		t.Fatalf(
			"Order pertama seharusnya %d, mendapat %d",
			olderOrderID,
			firstBatch[0],
		)
	}

	// Limit besar harus mengambil semua order yang memenuhi syarat.
	allExpired, err := repository.FindExpiredPendingOrderIDs(
		context.Background(),
		now,
		100,
	)
	if err != nil {
		t.Fatalf(
			"Finder seluruh expired order gagal: %v",
			err,
		)
	}

	if len(allExpired) != 2 {
		t.Fatalf(
			"Seharusnya hanya menemukan 2 order, mendapat %d: %v",
			len(allExpired),
			allExpired,
		)
	}

	// Urutan harus berdasarkan expires_at paling lama.
	if allExpired[0] != olderOrderID {
		t.Fatalf(
			"Order pertama seharusnya %d, mendapat %d",
			olderOrderID,
			allExpired[0],
		)
	}

	if allExpired[1] != newerOrderID {
		t.Fatalf(
			"Order kedua seharusnya %d, mendapat %d",
			newerOrderID,
			allExpired[1],
		)
	}

	// Waktu kosong harus ditolak.
	_, err = repository.FindExpiredPendingOrderIDs(
		context.Background(),
		time.Time{},
		100,
	)
	if err == nil {
		t.Fatal("Waktu kosong seharusnya ditolak")
	}

	// Limit nol harus ditolak.
	_, err = repository.FindExpiredPendingOrderIDs(
		context.Background(),
		now,
		0,
	)
	if err == nil {
		t.Fatal("Limit 0 seharusnya ditolak")
	}

	// Limit terlalu besar juga harus ditolak.
	_, err = repository.FindExpiredPendingOrderIDs(
		context.Background(),
		now,
		501,
	)
	if err == nil {
		t.Fatal("Limit di atas 500 seharusnya ditolak")
	}

	// Context nil harus ditolak.
	_, err = repository.FindExpiredPendingOrderIDs(
		nil,
		now,
		100,
	)
	if err == nil {
		t.Fatal("Context nil seharusnya ditolak")
	}

	t.Logf(
		"Finder berhasil: semua=%v batchPertama=%v",
		allExpired,
		firstBatch,
	)
}
