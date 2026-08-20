package service

import (
	"animcommerce/backend/repository"
	"fmt"
	"os"

	"github.com/phpdave11/gofpdf"
	"gorm.io/gorm"
)

type InvoiceService interface {
	GenerateInvoice(orderID int64) (string, error)
}

type invoiceService struct {
	orderRepo repository.OrderRepository
	db        *gorm.DB
}

func NewInvoiceService(orderRepo repository.OrderRepository, db *gorm.DB) InvoiceService {
	return &invoiceService{
		orderRepo: orderRepo,
		db:        db,
	}
}

func (s *invoiceService) GenerateInvoice(orderID int64) (string, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return "", err
	}

	err = os.MkdirAll("storage/invoices", os.ModePerm)
	if err != nil {
		return "", err
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 18)
	pdf.Cell(190, 10, "ANIMCOMMERCE INVOICE")

	pdf.Ln(15)

	pdf.SetFont("Arial", "", 12)

	pdf.Cell(190, 8, "Order Number: "+order.OrderNumber)
	pdf.Ln(8)

	pdf.Cell(190, 8, "Receiver: "+order.UserAddress.ReceiverName)
	pdf.Ln(8)

	pdf.Cell(190, 8, "Phone: "+order.UserAddress.PhoneNumber)
	pdf.Ln(8)

	address := fmt.Sprintf(
		"%s, %s, %s",
		order.UserAddress.AddressLine,
		order.UserAddress.City,
		order.UserAddress.PostalCode,
	)

	pdf.MultiCell(190, 8, address, "", "", false)

	pdf.Ln(5)

	pdf.Cell(80, 8, "Product")
	pdf.Cell(30, 8, "Qty")
	pdf.Cell(50, 8, "Price")

	pdf.Ln(10)

	for _, item := range order.OrderItem {
		pdf.Cell(80, 8, item.Product.Title)
		pdf.Cell(30, 8, fmt.Sprintf("%d", item.Quantity))
		pdf.Cell(50, 8, fmt.Sprintf("Rp %d", item.Price))
		pdf.Ln(8)
	}

	pdf.Ln(10)
	pdf.Cell(190, 8, fmt.Sprintf("Shipping cost : Rp %d", order.ShippingCost))
	pdf.Ln(8)

	pdf.Cell(190, 8, fmt.Sprintf("Total Price : Rp %d", order.TotalPrice))

	filename := fmt.Sprintf(
		"storage/invoices/invoice_%d.pdf",
		order.ID,
	)

	err = pdf.OutputFileAndClose(filename)
	if err != nil {
		return "", err
	}

	err = s.db.Model(order).Update("invoice_url", filename).Error
	if err != nil {
		return "", err
	}

	return filename, nil
}
