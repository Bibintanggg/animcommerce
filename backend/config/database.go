package config

import (
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "root@tcp(127.0.0.1:3306)/animcommerce?charset=utf8mb4&parseTime=True&loc=Local"
	}
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	fmt.Println("Database connected")

	return db
}
