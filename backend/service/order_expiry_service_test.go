package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"animcommerce/backend/repository"
	"context"
	"errors"
	"fmt"
	"os"
	"testing"
	"time"

	mysqlDriver "github.com/go-sql-driver/mysql"
	gormMysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type expiryTestFixture struct {
	UserID    int64
	AddressID int64
	ProductID int64
	OrderID   int64
	PaymentID int64
}

type fixedExpiredOrderRepository struct {
	repository.OrderRepository
	orderIDs []int64
}

func openExpiryTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	username, exists := os.LookupEnv("TEST_DB_USER")
	if !exists {
		t.Fatal("TEST_DB_USER belum diatur di terminal")
	}

	password, exists := os.LookupEnv("TEST_DB_PASSWORD")
	if !exists {
		t.Fatal("TEST_DB_PASSWORD belum diatur di terminal")
	}

	config := mysqlDriver.NewConfig()
	config.User = username
	config.Passwd = password
	config.Net = "tcp"
	config.Addr = "127.0.0.1:3306"
	config.DBName = "animcommerce_test"
	config.ParseTime = true
	config.Timeout = 5 * time.Second
	config.ReadTimeout = 5 * time.Second
	config.WriteTimeout = 5 * time.Second

	db, err := gorm.Open(
		gormMysql.Open(config.FormatDSN()),
		&gorm.Config{},
	)
	if err != nil {
		t.Fatalf("Gagal terhubung ke database testing: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Gagal mengambil koneksi database: %v", err)
	}

	sqlDB.SetMaxOpenConns(4)
	sqlDB.SetMaxIdleConns(4)

	t.Cleanup(func() {
		if err := sqlDB.Close(); err != nil {
			t.Errorf("Gagal menutup koneksi database: %v", err)
		}
	})

	var databaseName string

	if err := db.
		Raw("SELECT DATABASE()").
		Scan(&databaseName).Error; err != nil {
		t.Fatalf("Gagal memeriksa nama database: %v", err)
	}

	if databaseName != "animcommerce_test" {
		t.Fatalf(
			"Test dihentikan karena terhubung ke database %q",
			databaseName,
		)
	}

	return db
}

func createExpiredOrderFixture(
	t *testing.T,
) (*gorm.DB, *orderService, expiryTestFixture) {
	t.Helper()

	db := openExpiryTestDB(t)

	err := db.
		Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(
			&models.User{},
			&models.UserAddress{},
			&models.Product{},
			&models.OrderProduct{},
			&models.OrderItem{},
			&models.Payment{},
			&models.OrderStatusHistory{},
			&models.StockMovement{},
		)

	if err != nil {
		t.Fatalf("Gagal menyiapkan tabel testing: %v", err)
	}

	var transactionalTables int64

	err = db.Raw(`
		SELECT COUNT(*)
		FROM information_schema.tables
		WHERE table_schema = DATABASE()
		  AND table_name IN (
			  'users',
			  'user_addresses',
			  'products',
			  'order_products',
			  'order_items',
			  'payments',
			  'order_status_histories',
			  'stock_movements'
		  )
		  AND engine = 'InnoDB'
	`).Scan(&transactionalTables).Error

	if err != nil {
		t.Fatalf("Gagal memeriksa engine tabel: %v", err)
	}

	if transactionalTables != 8 {
		t.Fatal("Semua tabel expiry harus menggunakan engine InnoDB")
	}

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())
	expiresAt := time.Now().Add(-1 * time.Hour)

	user := models.User{
		Name:     "Expiry Test User",
		Email:    "expiry-" + suffix + "@example.invalid",
		Password: "fixture-only-not-for-login",
		Role:     enum.AdminRole,
	}

	address := models.UserAddress{
		ReceiverName: "Penerima Testing",
		PhoneNumber:  "081234567890",
		AddressLine:  "Jalan Integration Test Nomor 1",
		Province:     "DKI Jakarta",
		City:         "Jakarta Timur",
		District:     "Duren Sawit",
		PostalCode:   "13440",
		IsDefault:    false,
	}

	// Stok 3 menggambarkan stok setelah checkout mengurangi 2
	// dari stok awal 5.
	product := models.Product{
		Title:       "Produk Expiry Testing",
		Thumbnail:   "test-thumbnail.png",
		Slug:        "expiry-product-" + suffix,
		Description: "Produk khusus pengujian expiry order",
		Price:       100_000,
		Stock:       3,
		IsActive:    enum.ProductPublished,
	}

	order := models.OrderProduct{
		OrderNumber:    "TEST-" + suffix,
		TotalPrice:     200_000,
		ShippingCost:   25_000,
		StatusOrder:    enum.OrderPending,
		StatusShipment: enum.ShipmentAwaitingPickup,
	}

	var payment models.Payment

	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		address.UserID = user.ID

		if err := tx.Create(&address).Error; err != nil {
			return err
		}

		product.UserID = user.ID

		if err := tx.Create(&product).Error; err != nil {
			return err
		}

		order.UserID = user.ID
		order.AddressID = address.ID

		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		item := models.OrderItem{
			OrderID:   order.ID,
			ProductID: product.ID,
			Quantity:  2,
			Price:     100_000,
		}

		if err := tx.Create(&item).Error; err != nil {
			return err
		}

		payment = models.Payment{
			OrderID:           order.ID,
			PaymentMethod:     "qris",
			PaymentStatus:     enum.PaymentPending,
			Provider:          "dummy",
			ExternalReference: "DUMMY-" + order.OrderNumber,
			QRString:          "EXPIRY-TEST-QR",
			Amount:            225_000,
			ExpiresAt:         &expiresAt,
		}

		return tx.Create(&payment).Error
	})

	if err != nil {
		t.Fatalf("Gagal membuat fixture expiry: %v", err)
	}

	fixture := expiryTestFixture{
		UserID:    user.ID,
		AddressID: address.ID,
		ProductID: product.ID,
		OrderID:   order.ID,
		PaymentID: payment.ID,
	}

	t.Cleanup(func() {
		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.
				Where("order_id = ?", fixture.OrderID).
				Delete(&models.OrderStatusHistory{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("order_id = ?", fixture.OrderID).
				Delete(&models.Payment{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("order_id = ?", fixture.OrderID).
				Delete(&models.OrderItem{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("id = ?", fixture.OrderID).
				Delete(&models.OrderProduct{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("product_id = ?", fixture.ProductID).
				Delete(&models.StockMovement{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("id = ?", fixture.ProductID).
				Delete(&models.Product{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("id = ?", fixture.AddressID).
				Delete(&models.UserAddress{}).Error; err != nil {
				return err
			}

			return tx.
				Where("id = ?", fixture.UserID).
				Delete(&models.User{}).Error
		})

		if err != nil {
			t.Errorf("Gagal membersihkan fixture expiry: %v", err)
		}
	})

	orderService := &orderService{
		db:          db,
		orderRepo:   repository.NewOrderRepository(db),
		productRepo: repository.NewProductRepository(db),
	}

	return db, orderService, fixture
}

func TestExpireOrder_SuccessAndIdempotent(t *testing.T) {
	db, service, fixture := createExpiredOrderFixture(t)

	// Pemanggilan pertama harus memproses expiry.
	expired, err := service.ExpireOrder(
		context.Background(),
		fixture.OrderID,
		time.Now(),
	)

	if err != nil {
		t.Fatalf("ExpireOrder seharusnya berhasil: %v", err)
	}

	if !expired {
		t.Fatal("Order seharusnya diproses menjadi expired")
	}

	// Pemanggilan kedua terhadap order yang sama harus dilewati.
	expiredAgain, err := service.ExpireOrder(
		context.Background(),
		fixture.OrderID,
		time.Now(),
	)

	if err != nil {
		t.Fatalf("Pemanggilan kedua menghasilkan error: %v", err)
	}

	if expiredAgain {
		t.Fatal("Order tidak boleh diproses expiry dua kali")
	}

	var order models.OrderProduct

	if err := db.First(&order, fixture.OrderID).Error; err != nil {
		t.Fatalf("Gagal membaca order: %v", err)
	}

	if order.StatusOrder != enum.OrderCancelled {
		t.Fatalf(
			"Status order seharusnya %q, mendapat %q",
			enum.OrderCancelled,
			order.StatusOrder,
		)
	}

	if order.StatusShipment != enum.ShipmentAwaitingPickup {
		t.Fatalf(
			"Status shipment berubah menjadi %q",
			order.StatusShipment,
		)
	}

	var payment models.Payment

	if err := db.First(&payment, fixture.PaymentID).Error; err != nil {
		t.Fatalf("Gagal membaca payment: %v", err)
	}

	if payment.PaymentStatus != enum.PaymentExpired {
		t.Fatalf(
			"Status payment seharusnya %q, mendapat %q",
			enum.PaymentExpired,
			payment.PaymentStatus,
		)
	}

	var product models.Product

	if err := db.First(&product, fixture.ProductID).Error; err != nil {
		t.Fatalf("Gagal membaca produk: %v", err)
	}

	if product.Stock != 5 {
		t.Fatalf(
			"Stok seharusnya kembali menjadi 5, mendapat %d",
			product.Stock,
		)
	}

	var movements []models.StockMovement

	if err := db.
		Where("product_id = ?", fixture.ProductID).
		Order("id ASC").
		Find(&movements).Error; err != nil {
		t.Fatalf("Gagal membaca stock movement: %v", err)
	}

	if len(movements) != 1 {
		t.Fatalf(
			"Restore stock harus tercatat tepat satu kali, mendapat %d",
			len(movements),
		)
	}

	movement := movements[0]

	if movement.Type != enum.StockIn ||
		movement.Quantity != 2 ||
		movement.StockBefore != 3 ||
		movement.StockAfter != 5 {
		t.Fatalf(
			"Stock movement tidak sesuai: %+v",
			movement,
		)
	}

	var histories []models.OrderStatusHistory

	if err := db.
		Where("order_id = ?", fixture.OrderID).
		Order("id ASC").
		Find(&histories).Error; err != nil {
		t.Fatalf("Gagal membaca status history: %v", err)
	}

	if len(histories) != 1 {
		t.Fatalf(
			"History expiry harus tercatat tepat satu kali, mendapat %d",
			len(histories),
		)
	}

	if histories[0].StatusOrder != enum.OrderCancelled {
		t.Fatalf(
			"History seharusnya berstatus cancelled, mendapat %q",
			histories[0].StatusOrder,
		)
	}

	t.Logf(
		"Expiry berhasil: order=%s payment=%s stok=%d movement=%d history=%d",
		order.StatusOrder,
		payment.PaymentStatus,
		product.Stock,
		len(movements),
		len(histories),
	)
}

func TestExpireOrder_Concurrent(t *testing.T) {
	db, service, fixture := createExpiredOrderFixture(t)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		15*time.Second,
	)
	defer cancel()

	type expiryResult struct {
		expired bool
		err     error
	}

	now := time.Now()
	start := make(chan struct{})
	results := make(chan expiryResult, 2)

	for i := 0; i < 2; i++ {
		go func() {
			// Kedua goroutine mulai hampir bersamaan.
			<-start

			expired, err := service.ExpireOrder(
				ctx,
				fixture.OrderID,
				now,
			)

			results <- expiryResult{
				expired: expired,
				err:     err,
			}
		}()
	}

	close(start)

	processed := 0
	skipped := 0

	// Tunggu seluruh goroutine sebelum menjalankan assertion.
	for i := 0; i < 2; i++ {
		result := <-results

		if result.err != nil {
			t.Fatalf(
				"Concurrent ExpireOrder menghasilkan error: %v",
				result.err,
			)
		}

		if result.expired {
			processed++
		} else {
			skipped++
		}
	}

	if processed != 1 || skipped != 1 {
		t.Fatalf(
			"Seharusnya processed=1 skipped=1; mendapat processed=%d skipped=%d",
			processed,
			skipped,
		)
	}

	var order models.OrderProduct

	if err := db.First(&order, fixture.OrderID).Error; err != nil {
		t.Fatalf("Gagal membaca order: %v", err)
	}

	if order.StatusOrder != enum.OrderCancelled {
		t.Fatalf(
			"Order seharusnya cancelled, mendapat %q",
			order.StatusOrder,
		)
	}

	var payment models.Payment

	if err := db.First(&payment, fixture.PaymentID).Error; err != nil {
		t.Fatalf("Gagal membaca payment: %v", err)
	}

	if payment.PaymentStatus != enum.PaymentExpired {
		t.Fatalf(
			"Payment seharusnya expired, mendapat %q",
			payment.PaymentStatus,
		)
	}

	var product models.Product

	if err := db.First(&product, fixture.ProductID).Error; err != nil {
		t.Fatalf("Gagal membaca produk: %v", err)
	}

	if product.Stock != 5 {
		t.Fatalf(
			"Stok seharusnya hanya dikembalikan sekali menjadi 5, mendapat %d",
			product.Stock,
		)
	}

	var movementCount int64

	if err := db.
		Model(&models.StockMovement{}).
		Where("product_id = ?", fixture.ProductID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("Gagal menghitung stock movement: %v", err)
	}

	if movementCount != 1 {
		t.Fatalf(
			"Stock movement seharusnya hanya 1, mendapat %d",
			movementCount,
		)
	}

	var historyCount int64

	if err := db.
		Model(&models.OrderStatusHistory{}).
		Where("order_id = ?", fixture.OrderID).
		Count(&historyCount).Error; err != nil {
		t.Fatalf("Gagal menghitung status history: %v", err)
	}

	if historyCount != 1 {
		t.Fatalf(
			"Status history seharusnya hanya 1, mendapat %d",
			historyCount,
		)
	}

	t.Logf(
		"Concurrent aman: processed=%d skipped=%d stok=%d movement=%d history=%d",
		processed,
		skipped,
		product.Stock,
		movementCount,
		historyCount,
	)
}

func TestExpireOrder_Rollback(t *testing.T) {
	db, service, fixture := createExpiredOrderFixture(t)

	simulatedError := errors.New(
		"simulasi gagal menyimpan order status history",
	)

	callbackName := fmt.Sprintf(
		"test:fail-expiry-history:%d",
		time.Now().UnixNano(),
	)

	// Paksa INSERT ke order_status_histories gagal.
	err := db.
		Callback().
		Create().
		Before("gorm:create").
		Register(callbackName, func(tx *gorm.DB) {
			if tx.Statement.Schema != nil &&
				tx.Statement.Schema.Table == "order_status_histories" {
				tx.AddError(simulatedError)
			}
		})

	if err != nil {
		t.Fatalf("Gagal memasang callback testing: %v", err)
	}

	// Hapus callback agar tidak memengaruhi test berikutnya.
	t.Cleanup(func() {
		if err := db.
			Callback().
			Create().
			Remove(callbackName); err != nil {
			t.Errorf("Gagal menghapus callback testing: %v", err)
		}
	})

	expired, err := service.ExpireOrder(
		context.Background(),
		fixture.OrderID,
		time.Now(),
	)

	if err == nil {
		t.Fatal("ExpireOrder seharusnya gagal ketika history gagal disimpan")
	}

	if !errors.Is(err, simulatedError) {
		t.Fatalf(
			"Mengharapkan error simulasi, mendapat: %v",
			err,
		)
	}

	if expired {
		t.Fatal("ExpireOrder tidak boleh menghasilkan true ketika transaction gagal")
	}

	// Semua data harus kembali seperti sebelum ExpireOrder dijalankan.
	var order models.OrderProduct

	if err := db.First(&order, fixture.OrderID).Error; err != nil {
		t.Fatalf("Gagal membaca order setelah rollback: %v", err)
	}

	if order.StatusOrder != enum.OrderPending {
		t.Fatalf(
			"Status order seharusnya kembali pending, mendapat %q",
			order.StatusOrder,
		)
	}

	if order.StatusShipment != enum.ShipmentAwaitingPickup {
		t.Fatalf(
			"Status shipment berubah setelah rollback: %q",
			order.StatusShipment,
		)
	}

	var payment models.Payment

	if err := db.First(&payment, fixture.PaymentID).Error; err != nil {
		t.Fatalf("Gagal membaca payment setelah rollback: %v", err)
	}

	if payment.PaymentStatus != enum.PaymentPending {
		t.Fatalf(
			"Status payment seharusnya kembali pending, mendapat %q",
			payment.PaymentStatus,
		)
	}

	var product models.Product

	if err := db.First(&product, fixture.ProductID).Error; err != nil {
		t.Fatalf("Gagal membaca produk setelah rollback: %v", err)
	}

	if product.Stock != 3 {
		t.Fatalf(
			"Stok seharusnya kembali menjadi 3, mendapat %d",
			product.Stock,
		)
	}

	var movementCount int64

	if err := db.
		Model(&models.StockMovement{}).
		Where("product_id = ?", fixture.ProductID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("Gagal menghitung stock movement: %v", err)
	}

	if movementCount != 0 {
		t.Fatalf(
			"Stock movement seharusnya ikut rollback, mendapat %d",
			movementCount,
		)
	}

	var historyCount int64

	if err := db.
		Model(&models.OrderStatusHistory{}).
		Where("order_id = ?", fixture.OrderID).
		Count(&historyCount).Error; err != nil {
		t.Fatalf("Gagal menghitung status history: %v", err)
	}

	if historyCount != 0 {
		t.Fatalf(
			"History seharusnya tidak tersimpan, mendapat %d",
			historyCount,
		)
	}

	t.Logf(
		"Rollback berhasil: order=%s payment=%s stok=%d movement=%d history=%d",
		order.StatusOrder,
		payment.PaymentStatus,
		product.Stock,
		movementCount,
		historyCount,
	)
}

func (r *fixedExpiredOrderRepository) FindExpiredPendingOrderIDs(
	ctx context.Context,
	now time.Time,
	limit int,
) ([]int64, error) {
	result := make([]int64, len(r.orderIDs))
	copy(result, r.orderIDs)

	return result, nil
}

func TestExpirePendingOrders_SuccessAndIdempotent(t *testing.T) {
	db, orderServiceInstance, fixture := createExpiredOrderFixture(t)

	realOrderRepository := repository.NewOrderRepository(db)

	orderServiceInstance.orderRepo = &fixedExpiredOrderRepository{
		OrderRepository: realOrderRepository,
		orderIDs: []int64{
			fixture.OrderID,
		},
	}

	now := time.Now()

	firstExpired, err := orderServiceInstance.ExpireOrder(
		context.Background(),
		fixture.OrderID,
		now,
	)
	if err != nil {
		t.Fatalf(
			"ExpirePendingOrders pertama seharusnya berhasil: %v",
			err,
		)
	}

	if !firstExpired {
		t.Fatal("Order seharusnya diproses pada pemanggilan pertama")
	}

	// Fake finder masih mengembalikan ID yang sama.
	// Karena order sudah cancelled, batch kedua harus melewatinya.
	secondExpired, err := orderServiceInstance.ExpireOrder(
		context.Background(),
		fixture.OrderID,
		now,
	)
	if err != nil {
		t.Fatalf(
			"ExpirePendingOrders kedua menghasilkan error: %v",
			err,
		)
	}

	if secondExpired {
		t.Fatal("Order tidak boleh diproses expiry dua kali")
	}

	var order models.OrderProduct

	if err := db.First(&order, fixture.OrderID).Error; err != nil {
		t.Fatalf("Gagal membaca order: %v", err)
	}

	if order.StatusOrder != enum.OrderCancelled {
		t.Fatalf(
			"Order seharusnya cancelled, mendapat %q",
			order.StatusOrder,
		)
	}

	var payment models.Payment

	if err := db.First(&payment, fixture.PaymentID).Error; err != nil {
		t.Fatalf("Gagal membaca payment: %v", err)
	}

	if payment.PaymentStatus != enum.PaymentExpired {
		t.Fatalf(
			"Payment seharusnya expired, mendapat %q",
			payment.PaymentStatus,
		)
	}

	var product models.Product

	if err := db.First(&product, fixture.ProductID).Error; err != nil {
		t.Fatalf("Gagal membaca produk: %v", err)
	}

	if product.Stock != 5 {
		t.Fatalf(
			"Stok seharusnya hanya dikembalikan sekali menjadi 5, mendapat %d",
			product.Stock,
		)
	}

	var movementCount int64

	if err := db.
		Model(&models.StockMovement{}).
		Where("product_id = ?", fixture.ProductID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("Gagal menghitung stock movement: %v", err)
	}

	if movementCount != 1 {
		t.Fatalf(
			"Stock movement seharusnya tetap 1, mendapat %d",
			movementCount,
		)
	}

	var historyCount int64

	if err := db.
		Model(&models.OrderStatusHistory{}).
		Where("order_id = ?", fixture.OrderID).
		Count(&historyCount).Error; err != nil {
		t.Fatalf("Gagal menghitung status history: %v", err)
	}

	if historyCount != 1 {
		t.Fatalf(
			"Status history seharusnya tetap 1, mendapat %d",
			historyCount,
		)
	}

	t.Logf(
		"Pemanggilan pertama=%t; pemanggilan kedua=%t; stok=%d",
		firstExpired,
		secondExpired,
		product.Stock,
	)
}
