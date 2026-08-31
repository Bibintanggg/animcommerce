package helper

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
)

const orderCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

func GenerateOrder() (string, error) {
	randomCode := make([]byte, 6)
	for index := range randomCode {
		randomIndex, err := rand.Int(
			rand.Reader,
			big.NewInt(int64(len(orderCharacters))),
		)
		if err != nil {
			return "", err
		}

		randomCode[index] = orderCharacters[randomIndex.Int64()]
	}

	return fmt.Sprintf(
		"ORD-%s-%s",
		time.Now().Format("060102"),
		string(randomCode),
	), nil
}
