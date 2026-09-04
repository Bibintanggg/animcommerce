package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/models/enum"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
)

type MidtransPaymentGateway struct {
	client *coreapi.Client
}

var _ PaymentGateway = (*MidtransPaymentGateway)(nil)

func NewMidtransPaymentGateway(client *coreapi.Client) PaymentGateway {
	return &MidtransPaymentGateway{
		client: client,
	}
}

func (g *MidtransPaymentGateway) CreatePayment(input CreatePaymentInput) (models.Payment, error) {
	if g == nil || g.client == nil {
		return models.Payment{}, errors.New("Midtrans client belum diinisialisasi")
	}

	if strings.TrimSpace(input.OrderNumber) == "" {
		return models.Payment{}, errors.New("Nomor order tidak boleh kosong")
	}

	if input.OrderID <= 0 {
		return models.Payment{}, errors.New("ID order tidak valid")
	}

	if input.Amount <= 0 {
		return models.Payment{}, errors.New("Jumlah pembayaran harus lebih dari 0")
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	request := &coreapi.ChargeReq{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  input.OrderNumber,
			GrossAmt: input.Amount,
		},

		CustomExpiry: &coreapi.CustomExpiry{
			ExpiryDuration: 24,
			Unit:           "hour",
		},
	}

	switch input.Method {
	case "qris":
		request.PaymentType = coreapi.PaymentTypeQris
		request.Qris = &coreapi.QrisDetails{
			Acquirer: "gopay",
		}

	case "bca_va":
		request.PaymentType = coreapi.PaymentTypeBankTransfer
		request.BankTransfer = &coreapi.BankTransferDetails{
			Bank: midtrans.BankBca,
		}

	default:
		return models.Payment{}, errors.New("Metode pembayaran tidak didukung")
	}

	response, midtransError := g.client.ChargeTransaction(request)
	if midtransError != nil {
		return models.Payment{}, fmt.Errorf("gagal membuat transaksi Midtrans: %w", midtransError)
	}

	if response == nil {
		return models.Payment{}, errors.New("Response midtrans kosong")
	}

	payment := models.Payment{
		OrderID:           input.OrderID,
		PaymentMethod:     input.Method,
		PaymentStatus:     enum.PaymentPending,
		Provider:          "midtrans",
		ExternalReference: response.TransactionID,
		Amount:            input.Amount,
		ExpiresAt:         &expiresAt,
	}

	switch input.Method {
	case "qris":
		payment.QRURL = findMidtransQRURL(response.Actions)
		payment.QRString = response.QRString

		if payment.QRURL == "" {
			return models.Payment{}, errors.New(
				"URL QRIS tidak ditemukan pada respons Midtrans",
			)
		}

	case "bca_va":
		payment.VANumber = findBCAVANumber(response.VaNumbers)

		if payment.VANumber == "" {
			return models.Payment{}, errors.New("nomor BCA VA tidak ditemukan pada respons Midtrans")
		}

	}

	return payment, nil
}

func findMidtransQRURL(actions []coreapi.Action) string {
	prefferedActions := []string{
		"generate-qr-code-v2",
		"generate-qr-code",
	}

	for _, preferred := range prefferedActions {
		for _, actions := range actions {
			if actions.Name == preferred && actions.URL != "" {
				return actions.URL
			}
		}
	}

	return ""
}

func findBCAVANumber(vaNumbers []coreapi.VANumber) string {
	for _, va := range vaNumbers {
		if strings.EqualFold(va.Bank, "bca") &&
			va.VANumber != "" {
			return va.VANumber
		}
	}

	return ""
}

func (g *MidtransPaymentGateway) GetPaymentStatus(orderNumber string) (PaymentStatusResult, error) {
	orderNumber = strings.TrimSpace(orderNumber)
	if g == nil || g.client == nil {
		return PaymentStatusResult{}, errors.New("Midtrans client belum diinisialisasi")
	}

	if orderNumber == "" {
		return PaymentStatusResult{}, errors.New("Nomor order wajib diisi")
	}

	response, midtransError := g.client.CheckTransaction(orderNumber)
	if midtransError != nil {
		return PaymentStatusResult{}, fmt.Errorf("Gagal memeriksa transaksi midtrans", midtransError)
	}

	if response == nil {
		return PaymentStatusResult{}, errors.New("Response status midtrans kosong")
	}

	return PaymentStatusResult{
		OrderNumber:       response.OrderID,
		TransactionID:     response.TransactionID,
		TransactionStatus: response.TransactionStatus,
		FraudStatus:       response.FraudStatus,
		GrossAmount:       response.GrossAmount,
	}, nil
}
