package helper

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var SECRET_KEY = []byte(os.Getenv("SECRET_KEY"))

type JWTClaim struct {
	UserID int64  `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int64) (string, error) {
	claims := JWTClaim{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString(SECRET_KEY)

	if err != nil {
		return "", err
	}

	return signedToken, nil
}
