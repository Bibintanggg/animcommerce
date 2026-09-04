package service

import "animcommerce/backend/models"

type CreatePaymentInput struct {
	OrderID     int64
	OrderNumber string
	Amount      int64
	Method      string
}

type PaymentStatusResult struct {
	OrderNumber       string
	TransactionID     string
	TransactionStatus string
	FraudStatus       string
	GrossAmount       string
}

type PaymentGateway interface {
	CreatePayment(input CreatePaymentInput) (models.Payment, error)
	GetPaymentStatus(orderNumber string) (PaymentStatusResult, error)
}
