package repository

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
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

func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	username := os.Getenv("TEST_DB_USER")
	if username == "" {
		t.Fatal("TEST_DB belum diatur terminal")
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

	//tutup koneksi setelah selesai
	t.Cleanup(func() {
		if err := sqlDB.Close(); err != nil {
			t.Errorf("Gagal menutup koneksi database: %v", err)
		}
	})

	var databaseName string
	if err := db.Raw("SELECT DATABASE()").Scan(&databaseName).Error; err != nil {
		t.Fatalf("Gagal memeriksa nama database: %v", err)
	}

	if databaseName != "animcommerce_test" {
		t.Fatalf(
			"Test dihentikan: database yang terhubung adalah %q",
			databaseName,
		)
	}

	return db
}

func TestReduceStock_InsufficientStock(t *testing.T) {
	db := openTestDB(t)

	// Agar test ini bisa dijalankan sendiri.
	err := db.
		Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(
			&models.User{},
			&models.Product{},
			&models.StockMovement{},
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
			t.Errorf("Gagal membersihkan data percobaan: %v", err)
		}
	})

	// ========================================
	// ARRANGE: siapkan produk dengan stok 1
	// ========================================

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())

	user := models.User{
		Name:     "Admin Testing",
		Email:    "stock-insufficient-" + suffix + "@example.invalid",
		Password: "fixture-only-not-for-login",
		Role:     enum.AdminRole,
	}

	if err := tx.Create(&user).Error; err != nil {
		t.Fatalf("Gagal membuat user percobaan: %v", err)
	}

	product := models.Product{
		UserID:      user.ID,
		Title:       "Produk Testing Stok Terbatas",
		Thumbnail:   "test-thumbnail.png",
		Slug:        "stock-insufficient-" + suffix,
		Description: "Produk khusus pengujian stok tidak cukup",
		Price:       100_000,
		Stock:       1,
		IsActive:    enum.ProductPublished,
	}

	if err := tx.Create(&product).Error; err != nil {
		t.Fatalf("Gagal membuat produk percobaan: %v", err)
	}

	repo := NewProductRepository(db)

	// ========================================
	// ACT: coba kurangi 2, padahal stok hanya 1
	// ========================================

	err = repo.ReduceStock(tx, product.ID, 2)

	// ========================================
	// ASSERT: harus ditolak tanpa perubahan
	// ========================================

	if err == nil {
		t.Fatal("Seharusnya gagal karena stok tidak cukup, tetapi berhasil")
	}

	// Pastikan error memang karena stok, bukan karena query rusak.
	expectedError := "stock not enough"

	if err.Error() != expectedError {
		t.Fatalf(
			"Alasan kegagalan salah: mengharapkan %q, mendapat %q",
			expectedError,
			err.Error(),
		)
	}

	// Periksa stok SEBELUM cleanup menjalankan rollback.
	var updatedProduct models.Product

	if err := tx.First(&updatedProduct, product.ID).Error; err != nil {
		t.Fatalf("Gagal membaca stok produk: %v", err)
	}

	if updatedProduct.Stock != 1 {
		t.Fatalf(
			"Stok seharusnya tetap 1, tetapi mendapat %d",
			updatedProduct.Stock,
		)
	}

	// Tidak boleh ada catatan pengurangan stok.
	var movementCount int64

	if err := tx.
		Model(&models.StockMovement{}).
		Where("product_id = ?", product.ID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("Gagal menghitung mutasi stok: %v", err)
	}

	if movementCount != 0 {
		t.Fatalf(
			"Seharusnya tidak ada mutasi stok, tetapi mendapat %d",
			movementCount,
		)
	}

	t.Log("Stok tidak cukup ditolak; stok tetap 1; jumlah mutasi 0")
}

func TestReduceStock_Success(t *testing.T) {
	db := openTestDB(t)

	// Siapkan tabel di database testing.
	// Relasi model dapat membuat tabel terkait ikut dimigrasikan.
	err := db.
		Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(
			&models.User{},
			&models.Product{},
			&models.StockMovement{},
		)
	if err != nil {
		t.Fatalf("Gagal menyiapkan tabel testing: %v", err)
	}

	// Semua data percobaan dibuat dalam transaction ini.
	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Gagal memulai transaction: %v", tx.Error)
	}

	// Dijalankan setelah test selesai, termasuk ketika t.Fatal dipanggil.
	t.Cleanup(func() {
		if err := tx.Rollback().Error; err != nil {
			t.Errorf("Gagal membersihkan data percobaan: %v", err)
		}
	})

	// ========================================
	// ARRANGE: siapkan kondisi awal
	// ========================================

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())

	// Produk membutuhkan user pemilik karena ada foreign key.
	user := models.User{
		Name:     "Admin Testing",
		Email:    "stock-test-" + suffix + "@example.invalid",
		Password: "fixture-only-not-for-login",
		Role:     enum.AdminRole,
	}

	if err := tx.Create(&user).Error; err != nil {
		t.Fatalf("Gagal membuat user percobaan: %v", err)
	}

	product := models.Product{
		UserID:      user.ID,
		Title:       "Produk Testing Stok",
		Thumbnail:   "test-thumbnail.png",
		Slug:        "stock-test-" + suffix,
		Description: "Produk khusus integration test",
		Price:       100_000,
		Stock:       5,
		IsActive:    enum.ProductPublished,
	}

	if err := tx.Create(&product).Error; err != nil {
		t.Fatalf("Gagal membuat produk percobaan: %v", err)
	}

	repo := NewProductRepository(db)

	// ========================================
	// ACT: jalankan fungsi yang diuji
	// ========================================

	if err := repo.ReduceStock(tx, product.ID, 2); err != nil {
		t.Fatalf("ReduceStock seharusnya berhasil: %v", err)
	}

	// ========================================
	// ASSERT: periksa hasil dari database
	// ========================================

	// Ambil ulang produk, bukan membaca variabel product yang lama.
	var updatedProduct models.Product

	if err := tx.First(&updatedProduct, product.ID).Error; err != nil {
		t.Fatalf("Gagal membaca stok setelah pengurangan: %v", err)
	}

	if updatedProduct.Stock != 3 {
		t.Fatalf(
			"Stok salah: seharusnya 3, tetapi mendapat %d",
			updatedProduct.Stock,
		)
	}

	// Pastikan hanya satu catatan mutasi untuk produk percobaan ini.
	var movements []models.StockMovement

	if err := tx.
		Where("product_id = ?", product.ID).
		Find(&movements).Error; err != nil {
		t.Fatalf("Gagal membaca mutasi stok: %v", err)
	}

	if len(movements) != 1 {
		t.Fatalf(
			"Seharusnya ada 1 mutasi stok, tetapi mendapat %d",
			len(movements),
		)
	}

	movement := movements[0]

	if movement.Type != enum.StockOut {
		t.Errorf(
			"Jenis mutasi salah: seharusnya %s, mendapat %s",
			enum.StockOut,
			movement.Type,
		)
	}

	if movement.Quantity != 2 {
		t.Errorf(
			"Quantity mutasi salah: seharusnya 2, mendapat %d",
			movement.Quantity,
		)
	}

	if movement.StockBefore != 5 || movement.StockAfter != 3 {
		t.Errorf(
			"Riwayat stok salah: seharusnya 5 -> 3, mendapat %d -> %d",
			movement.StockBefore,
			movement.StockAfter,
		)
	}

	t.Logf(
		"Stok akhir: %d; jumlah mutasi: %d",
		updatedProduct.Stock,
		len(movements),
	)
}

func TestDatabaseConnection(t *testing.T) {
	db := openTestDB(t)

	var result int

	if err := db.Raw("SELECT 1").Scan(&result).Error; err != nil {
		t.Fatalf("Query percobaan gagal: %v", err)
	}

	if result != 1 {
		t.Fatalf("Hasil query seharusnya 1, tetapi mendapat %d", result)
	}

	t.Log("Koneksi ke animcommerce_test berhasil")
}

func createCommittedStockFixture(
	t *testing.T,
	stock int,
) (*gorm.DB, models.Product) {
	t.Helper()

	db := openTestDB(t)

	if err := db.
		Set("gorm:table_options", "ENGINE=InnoDB").
		AutoMigrate(
			&models.User{},
			&models.Product{},
			&models.StockMovement{},
		); err != nil {
		t.Fatalf("Gagal menyiapkan tabel testing: %v", err)
	}

	// Rollback dan penguncian baris memerlukan tabel transactional.
	var transactionalTables int64
	if err := db.Raw(`
		SELECT COUNT(*)
		FROM information_schema.tables
		WHERE table_schema = DATABASE()
		  AND table_name IN ('users', 'products', 'stock_movements')
		  AND engine = 'InnoDB'
	`).Scan(&transactionalTables).Error; err != nil {
		t.Fatalf("Gagal memeriksa engine tabel: %v", err)
	}

	if transactionalTables != 3 {
		t.Fatal("users, products, dan stock_movements harus memakai InnoDB")
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Gagal mengambil koneksi database: %v", err)
	}

	// Izinkan beberapa transaction memakai koneksi berbeda.
	sqlDB.SetMaxOpenConns(4)
	sqlDB.SetMaxIdleConns(4)

	suffix := fmt.Sprintf("%d", time.Now().UnixNano())

	user := models.User{
		Name:     "Admin Testing",
		Email:    "stock-fixture-" + suffix + "@example.invalid",
		Password: "fixture-only-not-for-login",
		Role:     enum.AdminRole,
	}

	product := models.Product{
		Title:       "Produk Testing Transaction",
		Thumbnail:   "test-thumbnail.png",
		Slug:        "stock-fixture-" + suffix,
		Description: "Produk khusus integration test",
		Price:       100_000,
		Stock:       stock,
		IsActive:    enum.ProductPublished,
	}

	// Simpan data awal dalam transaction tersendiri.
	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		product.UserID = user.ID
		return tx.Create(&product).Error
	}); err != nil {
		t.Fatalf("Gagal menyimpan data percobaan: %v", err)
	}

	// Hapus hanya data yang dibuat oleh fixture ini.
	t.Cleanup(func() {
		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.
				Where("product_id = ?", product.ID).
				Delete(&models.StockMovement{}).Error; err != nil {
				return err
			}

			if err := tx.
				Where("id = ?", product.ID).
				Delete(&models.Product{}).Error; err != nil {
				return err
			}

			return tx.
				Where("id = ?", user.ID).
				Delete(&models.User{}).Error
		})

		if err != nil {
			t.Errorf("Gagal membersihkan data percobaan: %v", err)
		}
	})

	return db, product
}

func TestReduceStock_Rollback(t *testing.T) {
	db, product := createCommittedStockFixture(t, 5)
	repo := NewProductRepository(db)

	simulatedError := errors.New(
		"simulasi kegagalan setelah pengurangan stok",
	)

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := repo.ReduceStock(tx, product.ID, 2); err != nil {
			return fmt.Errorf("ReduceStock gagal: %w", err)
		}

		// Pastikan perubahan benar-benar terjadi sebelum rollback.
		var insideProduct models.Product
		if err := tx.First(&insideProduct, product.ID).Error; err != nil {
			return err
		}

		var insideCount int64
		if err := tx.
			Model(&models.StockMovement{}).
			Where("product_id = ?", product.ID).
			Count(&insideCount).Error; err != nil {
			return err
		}

		if insideProduct.Stock != 3 || insideCount != 1 {
			return fmt.Errorf(
				"sebelum rollback: ingin stok 3 dan mutasi 1; mendapat stok %d dan mutasi %d",
				insideProduct.Stock,
				insideCount,
			)
		}

		// Error ini harus menyebabkan transaction dibatalkan.
		return simulatedError
	})

	// Jangan menganggap error database lain sebagai hasil yang benar.
	if !errors.Is(err, simulatedError) {
		t.Fatalf("Mengharapkan error simulasi, mendapat: %v", err)
	}

	// Transaction sudah berakhir. Baca kembali melalui db.
	var restoredProduct models.Product
	if err := db.First(&restoredProduct, product.ID).Error; err != nil {
		t.Fatalf("Produk seharusnya tetap ada: %v", err)
	}

	if restoredProduct.Stock != 5 {
		t.Fatalf(
			"Stok seharusnya kembali 5, mendapat %d",
			restoredProduct.Stock,
		)
	}

	var movementCount int64
	if err := db.
		Model(&models.StockMovement{}).
		Where("product_id = ?", product.ID).
		Count(&movementCount).Error; err != nil {
		t.Fatalf("Gagal memeriksa mutasi: %v", err)
	}

	if movementCount != 0 {
		t.Fatalf(
			"Mutasi seharusnya ikut dibatalkan, mendapat %d catatan",
			movementCount,
		)
	}

	t.Log("Rollback berhasil: produk tetap ada, stok kembali 5, mutasi 0")
}

func TestReduceStock_Concurrent(t *testing.T) {
	cases := []struct {
		name        string
		initial     int
		quantities  []int
		wantSuccess int
		wantStock   int
	}{
		{
			name:        "stok_terakhir",
			initial:     1,
			quantities:  []int{1, 1},
			wantSuccess: 1,
			wantStock:   0,
		},
		{
			name:        "stok_cukup",
			initial:     5,
			quantities:  []int{2, 1},
			wantSuccess: 2,
			wantStock:   2,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			db, product := createCommittedStockFixture(t, tc.initial)
			repo := NewProductRepository(db)

			ctx, cancel := context.WithTimeout(
				context.Background(),
				15*time.Second,
			)
			defer cancel()

			start := make(chan struct{})
			results := make(chan error, len(tc.quantities))

			// Setiap goroutine memakai transaction tersendiri.
			for _, quantity := range tc.quantities {
				go func(qty int) {
					// Tunggu sinyal mulai yang sama.
					<-start

					err := db.WithContext(ctx).Transaction(
						func(tx *gorm.DB) error {
							return repo.ReduceStock(tx, product.ID, qty)
						},
					)

					results <- err
				}(quantity)
			}

			// Lepaskan kedua goroutine.
			close(start)

			successes := 0
			rejected := 0

			// Tunggu SEMUA hasil sebelum memeriksa atau membersihkan data.
			for range tc.quantities {
				err := <-results

				switch {
				case err == nil:
					successes++

				case err.Error() == "stock not enough":
					// Sesuai pesan error di fungsi lokalmu.
					rejected++

				default:
					t.Errorf("Error yang tidak diharapkan: %v", err)
				}
			}

			if t.Failed() {
				return
			}

			wantRejected := len(tc.quantities) - tc.wantSuccess

			if successes != tc.wantSuccess || rejected != wantRejected {
				t.Fatalf(
					"Ingin berhasil=%d ditolak=%d; mendapat berhasil=%d ditolak=%d",
					tc.wantSuccess,
					wantRejected,
					successes,
					rejected,
				)
			}

			var updatedProduct models.Product
			if err := db.First(&updatedProduct, product.ID).Error; err != nil {
				t.Fatalf("Gagal membaca produk: %v", err)
			}

			if updatedProduct.Stock != tc.wantStock {
				t.Fatalf(
					"Stok akhir seharusnya %d, mendapat %d",
					tc.wantStock,
					updatedProduct.Stock,
				)
			}

			var movements []models.StockMovement
			if err := db.
				Where("product_id = ?", product.ID).
				Order("id ASC").
				Find(&movements).Error; err != nil {
				t.Fatalf("Gagal membaca mutasi: %v", err)
			}

			if len(movements) != tc.wantSuccess {
				t.Fatalf(
					"Seharusnya ada %d mutasi, mendapat %d",
					tc.wantSuccess,
					len(movements),
				)
			}

			// Riwayat harus berurutan dan sesuai stok akhir.
			remaining := tc.initial

			for _, movement := range movements {
				if movement.Type != enum.StockOut || movement.Quantity <= 0 {
					t.Fatalf("Mutasi pengurangan tidak valid: %+v", movement)
				}

				expectedAfter := remaining - movement.Quantity

				if movement.StockBefore != remaining ||
					movement.StockAfter != expectedAfter ||
					expectedAfter < 0 {
					t.Fatalf(
						"Riwayat stok tidak konsisten: sebelum=%d setelah=%d quantity=%d; stok sebelumnya seharusnya %d",
						movement.StockBefore,
						movement.StockAfter,
						movement.Quantity,
						remaining,
					)
				}

				remaining = expectedAfter
			}

			if remaining != updatedProduct.Stock {
				t.Fatalf(
					"Riwayat berakhir di stok %d, tetapi produk memiliki stok %d",
					remaining,
					updatedProduct.Stock,
				)
			}

			t.Logf(
				"Berhasil=%d; ditolak=%d; stok akhir=%d; mutasi=%d",
				successes,
				rejected,
				updatedProduct.Stock,
				len(movements),
			)
		})
	}
}

func TestRestoreStock_Success(t *testing.T) {
	db, product := createCommittedStockFixture(t, 3)
	repo := NewProductRepository(db)

	err := db.Transaction(func(tx *gorm.DB) error {
		return repo.RestoreStock(tx, product.ID, 2)
	})
	if err != nil {
		t.Fatalf("RestoreStock seharusnya berhasil: %v", err)
	}

	// Transaction sudah commit. Baca hasil dari database.
	var updatedProduct models.Product
	if err := db.First(&updatedProduct, product.ID).Error; err != nil {
		t.Fatalf("Gagal membaca produk: %v", err)
	}

	if updatedProduct.Stock != 5 {
		t.Fatalf(
			"Stok seharusnya menjadi 5, mendapat %d",
			updatedProduct.Stock,
		)
	}

	var movements []models.StockMovement
	if err := db.
		Where("product_id = ?", product.ID).
		Find(&movements).Error; err != nil {
		t.Fatalf("Gagal membaca mutasi stok: %v", err)
	}

	if len(movements) != 1 {
		t.Fatalf(
			"Seharusnya ada 1 mutasi stok, mendapat %d",
			len(movements),
		)
	}

	movement := movements[0]

	if movement.Type != enum.StockIn {
		t.Errorf(
			"Jenis mutasi seharusnya %s, mendapat %s",
			enum.StockIn,
			movement.Type,
		)
	}

	if movement.Quantity != 2 {
		t.Errorf(
			"Quantity mutasi seharusnya 2, mendapat %d",
			movement.Quantity,
		)
	}

	if movement.StockBefore != 3 || movement.StockAfter != 5 {
		t.Errorf(
			"Riwayat seharusnya 3 -> 5, mendapat %d -> %d",
			movement.StockBefore,
			movement.StockAfter,
		)
	}

	t.Logf(
		"Stok akhir: %d; jumlah mutasi: %d; jenis: %s",
		updatedProduct.Stock,
		len(movements),
		movement.Type,
	)
}
