package helper

import (
	"fmt"
	"math/rand"
	"time"
)

func GenerateOrderNumber() string {
	random := rand.Intn(9000) + 1000

	return fmt.Sprintf(
		"ORD-%s-%d",
		time.Now().Format("20060102150405"),
		random,
	)
}
