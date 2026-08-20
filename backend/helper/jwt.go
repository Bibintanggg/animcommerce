package helper

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const jwtIssuer = "animcommerce-api"

func jwtSecret() ([]byte, error) {
	secret := strings.TrimSpace(os.Getenv("SECRET_KEY"))
	if len(secret) < 32 {
		return nil, errors.New("SECRET_KEY must contain at least 32 characters")
	}

	return []byte(secret), nil
}

func ValidateJWTConfig() error {
	_, err := jwtSecret()
	return err
}

type JWTClaim struct {
	UserID int64  `json:"user_id"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int64) (string, error) {
	claims := JWTClaim{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    jwtIssuer,
			Subject:   strconv.FormatInt(userID, 10),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	secret, err := jwtSecret()
	if err != nil {
		return "", err
	}

	signedToken, err := token.SignedString(secret)

	if err != nil {
		return "", err
	}

	return signedToken, nil
}

func ParseToken(tokenString string) (*JWTClaim, error) {
	secret, err := jwtSecret()
	if err != nil {
		return nil, err
	}

	token, err := jwt.ParseWithClaims(
		tokenString,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}
			return secret, nil
		},
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithIssuer(jwtIssuer),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*JWTClaim)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
