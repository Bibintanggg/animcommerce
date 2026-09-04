package service

import "animcommerce/backend/models"

type CreatePaymentInput struct {
	OrderID     int64
	OrderNumber string
	Amount      string
	Method      string
}

type PaymentGateway interface {
	CreatePayment(input CreatePaymentInput) (models.Payment, error)
}

