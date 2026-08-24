package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

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

func NewInvoiceService(
	orderRepo repository.OrderRepository,
	db *gorm.DB,
) InvoiceService {
	return &invoiceService{
		orderRepo: orderRepo,
		db:        db,
	}
}

func (s *invoiceService) GenerateInvoice(
	orderID int64,
) (string, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return "", err
	}

	invoiceDirectory := filepath.Join(
		"storage",
		"invoices",
	)

	if err := os.MkdirAll(
		invoiceDirectory,
		0755,
	); err != nil {
		return "", err
	}

	pdf := gofpdf.New(
		"P",
		"mm",
		"A4",
		"",
	)

	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 20)
	pdf.SetCompression(true)

	pdf.SetTitle(
		"Invoice "+order.OrderNumber,
		false,
	)
	pdf.SetAuthor("AnimCommerce", false)
	pdf.SetCreator("AnimCommerce", false)

	pdf.AliasNbPages("")

	configureInvoiceHeaderFooter(
		pdf,
		order.OrderNumber,
	)

	pdf.AddPage()
	pdf.SetY(35)

	drawInvoiceSummary(pdf, order)
	drawCustomerAndAddress(pdf, order)

	pdf.SetY(126)

	drawItemsTable(
		pdf,
		order.OrderItem,
	)

	drawPaymentAndTotals(pdf, order)
	drawClosingNote(pdf)

	if err := pdf.Error(); err != nil {
		return "", err
	}

	filename := filepath.Join(
		invoiceDirectory,
		fmt.Sprintf(
			"invoice_%d.pdf",
			order.ID,
		),
	)

	if err := pdf.OutputFileAndClose(
		filename,
	); err != nil {
		return "", err
	}

	if err := s.db.
		Model(&models.OrderProduct{}).
		Where("id = ?", order.ID).
		Update("invoice_url", filename).
		Error; err != nil {
		return "", err
	}

	return filename, nil
}

func configureInvoiceHeaderFooter(
	pdf *gofpdf.Fpdf,
	orderNumber string,
) {
	pdf.SetHeaderFunc(func() {
		// Brand mark.
		pdf.SetFillColor(188, 0, 45)
		pdf.Rect(15, 12, 8, 8, "F")

		pdf.SetXY(27, 11.5)
		pdf.SetFont("Helvetica", "B", 15)
		pdf.SetTextColor(25, 25, 28)
		pdf.CellFormat(
			70,
			9,
			"ANIMCOMMERCE",
			"",
			0,
			"L",
			false,
			0,
			"",
		)

		pdf.SetXY(130, 13)
		pdf.SetFont("Helvetica", "", 8)
		pdf.SetTextColor(115, 115, 120)
		pdf.CellFormat(
			65,
			5,
			"Anime Fashion & Collectibles",
			"",
			0,
			"R",
			false,
			0,
			"",
		)

		pdf.SetDrawColor(225, 225, 228)
		pdf.Line(15, 27, 195, 27)
	})

	pdf.SetFooterFunc(func() {
		pdf.SetY(-16)

		pdf.SetDrawColor(225, 225, 228)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())

		pdf.Ln(3)

		pdf.SetFont("Helvetica", "", 7.5)
		pdf.SetTextColor(130, 130, 135)

		pdf.CellFormat(
			90,
			5,
			"AnimCommerce - Invoice "+orderNumber,
			"",
			0,
			"L",
			false,
			0,
			"",
		)

		pdf.CellFormat(
			90,
			5,
			fmt.Sprintf(
				"Page %d/{nb}",
				pdf.PageNo(),
			),
			"",
			0,
			"R",
			false,
			0,
			"",
		)
	})
}

func drawInvoiceSummary(
	pdf *gofpdf.Fpdf,
	order *models.OrderProduct,
) {
	startY := pdf.GetY()

	pdf.SetXY(15, startY)
	pdf.SetFont("Helvetica", "B", 26)
	pdf.SetTextColor(25, 25, 28)
	pdf.CellFormat(
		100,
		12,
		"INVOICE",
		"",
		1,
		"L",
		false,
		0,
		"",
	)

	pdf.SetX(15)
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetTextColor(110, 110, 115)
	pdf.CellFormat(
		100,
		6,
		"Thank you for shopping with AnimCommerce.",
		"",
		0,
		"L",
		false,
		0,
		"",
	)

	statusLabel := orderStatusLabel(
		string(order.StatusOrder),
	)

	statusR, statusG, statusB :=
		orderStatusColor(string(order.StatusOrder))

	pdf.SetFillColor(
		statusR,
		statusG,
		statusB,
	)
	pdf.Rect(15, startY+21, 38, 8, "F")

	pdf.SetXY(15, startY+21)
	pdf.SetFont("Helvetica", "B", 7.5)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(
		38,
		8,
		strings.ToUpper(statusLabel),
		"",
		0,
		"C",
		false,
		0,
		"",
	)

	// Invoice information box.
	boxX := 126.0
	boxY := startY
	boxW := 69.0
	boxH := 31.0

	pdf.SetFillColor(248, 248, 249)
	pdf.SetDrawColor(230, 230, 233)
	pdf.Rect(boxX, boxY, boxW, boxH, "DF")

	drawMetaRow(
		pdf,
		boxX,
		boxY+4,
		boxW,
		"Invoice",
		"INV-"+order.OrderNumber,
	)

	drawMetaRow(
		pdf,
		boxX,
		boxY+12,
		boxW,
		"Tanggal",
		order.CreatedAt.Format("02 Jan 2006"),
	)

	drawMetaRow(
		pdf,
		boxX,
		boxY+20,
		boxW,
		"Order ID",
		fmt.Sprintf("#%d", order.ID),
	)
}

func drawMetaRow(
	pdf *gofpdf.Fpdf,
	x float64,
	y float64,
	width float64,
	label string,
	value string,
) {
	pdf.SetXY(x+4, y)
	pdf.SetFont("Helvetica", "", 7.5)
	pdf.SetTextColor(125, 125, 130)
	pdf.CellFormat(
		22,
		5,
		label,
		"",
		0,
		"L",
		false,
		0,
		"",
	)

	pdf.SetFont("Helvetica", "B", 7.5)
	pdf.SetTextColor(35, 35, 38)
	pdf.CellFormat(
		width-30,
		5,
		value,
		"",
		0,
		"R",
		false,
		0,
		"",
	)
}

func drawCustomerAndAddress(
	pdf *gofpdf.Fpdf,
	order *models.OrderProduct,
) {
	y := 76.0
	gap := 7.0
	leftWidth := 86.5
	rightWidth := 86.5
	boxHeight := 43.0

	drawInformationBox(
		pdf,
		15,
		y,
		leftWidth,
		boxHeight,
		"CUSTOMER",
		[]string{
			order.User.Name,
			order.User.Email,
		},
	)

	addressParts := make([]string, 0)

	if order.UserAddress.AddressLine != "" {
		addressParts = append(
			addressParts,
			order.UserAddress.AddressLine,
		)
	}

	location := joinNonEmpty(
		", ",
		order.UserAddress.District,
		order.UserAddress.City,
		order.UserAddress.Province,
		order.UserAddress.PostalCode,
	)

	if location != "" {
		addressParts = append(
			addressParts,
			location,
		)
	}

	addressLines := []string{
		order.UserAddress.ReceiverName,
		order.UserAddress.PhoneNumber,
	}

	addressLines = append(
		addressLines,
		addressParts...,
	)

	drawInformationBox(
		pdf,
		15+leftWidth+gap,
		y,
		rightWidth,
		boxHeight,
		"ALAMAT PENGIRIMAN",
		addressLines,
	)
}

func drawInformationBox(
	pdf *gofpdf.Fpdf,
	x float64,
	y float64,
	width float64,
	height float64,
	title string,
	lines []string,
) {
	pdf.SetFillColor(250, 250, 251)
	pdf.SetDrawColor(232, 232, 235)
	pdf.Rect(
		x,
		y,
		width,
		height,
		"DF",
	)

	pdf.SetXY(x+5, y+4)
	pdf.SetFont("Helvetica", "B", 7.5)
	pdf.SetTextColor(188, 0, 45)
	pdf.CellFormat(
		width-10,
		5,
		title,
		"",
		1,
		"L",
		false,
		0,
		"",
	)

	currentY := y + 12

	for index, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}

		pdf.SetXY(x+5, currentY)

		if index == 0 {
			pdf.SetFont(
				"Helvetica",
				"B",
				9,
			)
			pdf.SetTextColor(
				35,
				35,
				38,
			)
		} else {
			pdf.SetFont(
				"Helvetica",
				"",
				8,
			)
			pdf.SetTextColor(
				95,
				95,
				100,
			)
		}

		pdf.MultiCell(
			width-10,
			4.5,
			line,
			"",
			"L",
			false,
		)

		currentY = pdf.GetY() + 1
	}
}

func drawItemsTable(
	pdf *gofpdf.Fpdf,
	items []models.OrderItem,
) {
	drawItemsTableHeader(pdf)

	if len(items) == 0 {
		y := pdf.GetY()

		pdf.SetFillColor(250, 250, 251)
		pdf.SetDrawColor(232, 232, 235)
		pdf.Rect(15, y, 180, 12, "DF")

		pdf.SetXY(15, y+3)
		pdf.SetFont("Helvetica", "", 8.5)
		pdf.SetTextColor(120, 120, 125)
		pdf.CellFormat(
			180,
			6,
			"Tidak ada produk.",
			"",
			0,
			"C",
			false,
			0,
			"",
		)

		pdf.SetY(y + 12)
		return
	}

	for index, item := range items {
		drawItemRow(pdf, index, item)
	}

	pdf.Ln(6)
}

func drawItemsTableHeader(
	pdf *gofpdf.Fpdf,
) {
	y := pdf.GetY()

	pdf.SetFillColor(28, 28, 31)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Helvetica", "B", 7.5)

	headers := []struct {
		Width float64
		Label string
		Align string
	}{
		{Width: 10, Label: "#", Align: "C"},
		{Width: 77, Label: "PRODUK", Align: "L"},
		{Width: 15, Label: "QTY", Align: "C"},
		{Width: 38, Label: "HARGA", Align: "R"},
		{Width: 40, Label: "JUMLAH", Align: "R"},
	}

	pdf.SetX(15)

	for _, header := range headers {
		pdf.CellFormat(
			header.Width,
			9,
			header.Label,
			"",
			0,
			header.Align,
			true,
			0,
			"",
		)
	}

	pdf.SetY(y + 9)
}

func drawItemRow(
	pdf *gofpdf.Fpdf,
	index int,
	item models.OrderItem,
) {
	productTitle := strings.TrimSpace(
		item.Product.Title,
	)

	if productTitle == "" {
		productTitle = "Produk"
	}

	pdf.SetFont("Helvetica", "", 8.5)

	titleLines := pdf.SplitLines(
		[]byte(productTitle),
		73,
	)

	rowHeight := math.Max(
		11,
		float64(len(titleLines))*4.7+4,
	)

	if pdf.GetY()+rowHeight > 265 {
		pdf.AddPage()
		pdf.SetY(35)
		drawItemsTableHeader(pdf)
	}

	x := 15.0
	y := pdf.GetY()

	if index%2 == 0 {
		pdf.SetFillColor(250, 250, 251)
	} else {
		pdf.SetFillColor(255, 255, 255)
	}

	pdf.SetDrawColor(232, 232, 235)
	pdf.Rect(
		x,
		y,
		180,
		rowHeight,
		"DF",
	)

	columnPositions := []float64{
		x + 10,
		x + 87,
		x + 102,
		x + 140,
	}

	for _, lineX := range columnPositions {
		pdf.Line(
			lineX,
			y,
			lineX,
			y+rowHeight,
		)
	}

	centerY := y + (rowHeight-5)/2

	// Number.
	pdf.SetXY(x, centerY)
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(95, 95, 100)
	pdf.CellFormat(
		10,
		5,
		strconv.Itoa(index+1),
		"",
		0,
		"C",
		false,
		0,
		"",
	)

	// Product title.
	pdf.SetXY(x+13, y+2)
	pdf.SetFont("Helvetica", "B", 8.5)
	pdf.SetTextColor(35, 35, 38)
	pdf.MultiCell(
		71,
		4.7,
		productTitle,
		"",
		"L",
		false,
	)

	// Quantity.
	pdf.SetXY(x+87, centerY)
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(65, 65, 70)
	pdf.CellFormat(
		15,
		5,
		fmt.Sprintf("%d", item.Quantity),
		"",
		0,
		"C",
		false,
		0,
		"",
	)

	// Unit price.
	pdf.SetXY(x+104, centerY)
	pdf.CellFormat(
		34,
		5,
		formatIDR(item.Price),
		"",
		0,
		"R",
		false,
		0,
		"",
	)

	// Line total.
	lineTotal := item.Price * item.Quantity

	pdf.SetXY(x+142, centerY)
	pdf.SetFont("Helvetica", "B", 8.5)
	pdf.SetTextColor(35, 35, 38)
	pdf.CellFormat(
		51,
		5,
		formatIDR(lineTotal),
		"",
		0,
		"R",
		false,
		0,
		"",
	)

	pdf.SetY(y + rowHeight)
}

func drawPaymentAndTotals(
	pdf *gofpdf.Fpdf,
	order *models.OrderProduct,
) {
	if pdf.GetY() > 235 {
		pdf.AddPage()
		pdf.SetY(35)
	}

	y := pdf.GetY()

	// Payment information.
	pdf.SetFillColor(250, 250, 251)
	pdf.SetDrawColor(232, 232, 235)
	pdf.Rect(15, y, 84, 36, "DF")

	pdf.SetXY(20, y+5)
	pdf.SetFont("Helvetica", "B", 7.5)
	pdf.SetTextColor(188, 0, 45)
	pdf.CellFormat(
		74,
		5,
		"INFORMASI PEMBAYARAN",
		"",
		1,
		"L",
		false,
		0,
		"",
	)

	method := "Tidak tersedia"
	paymentStatus := "Tidak tersedia"

	if order.Payment != nil {
		if order.Payment.PaymentMethod != "" {
			method = strings.ToUpper(
				order.Payment.PaymentMethod,
			)
		}

		paymentStatus = paymentStatusLabel(
			string(order.Payment.PaymentStatus),
		)
	}

	drawPaymentRow(
		pdf,
		20,
		y+15,
		74,
		"Metode",
		method,
	)

	drawPaymentRow(
		pdf,
		20,
		y+24,
		74,
		"Status",
		paymentStatus,
	)

	// Totals.
	totalX := 111.0
	totalWidth := 84.0

	drawTotalRow(
		pdf,
		totalX,
		y,
		totalWidth,
		"Subtotal",
		formatIDR(order.TotalPrice),
		false,
	)

	drawTotalRow(
		pdf,
		totalX,
		y+8,
		totalWidth,
		"Ongkos kirim",
		formatShipping(order.ShippingCost),
		false,
	)

	grandTotal :=
		order.TotalPrice +
			order.ShippingCost

	drawTotalRow(
		pdf,
		totalX,
		y+19,
		totalWidth,
		"TOTAL",
		formatIDR(grandTotal),
		true,
	)

	pdf.SetY(y + 42)
}

func drawPaymentRow(
	pdf *gofpdf.Fpdf,
	x float64,
	y float64,
	width float64,
	label string,
	value string,
) {
	pdf.SetXY(x, y)
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetTextColor(115, 115, 120)
	pdf.CellFormat(
		25,
		5,
		label,
		"",
		0,
		"L",
		false,
		0,
		"",
	)

	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetTextColor(35, 35, 38)
	pdf.CellFormat(
		width-25,
		5,
		value,
		"",
		0,
		"R",
		false,
		0,
		"",
	)
}

func drawTotalRow(
	pdf *gofpdf.Fpdf,
	x float64,
	y float64,
	width float64,
	label string,
	value string,
	highlight bool,
) {
	if highlight {
		pdf.SetFillColor(188, 0, 45)
		pdf.SetTextColor(255, 255, 255)
		pdf.Rect(
			x,
			y,
			width,
			13,
			"F",
		)

		pdf.SetXY(x+5, y+4)
		pdf.SetFont("Helvetica", "B", 9)
		pdf.CellFormat(
			25,
			5,
			label,
			"",
			0,
			"L",
			false,
			0,
			"",
		)

		pdf.SetFont("Helvetica", "B", 11)
		pdf.CellFormat(
			width-35,
			5,
			value,
			"",
			0,
			"R",
			false,
			0,
			"",
		)

		return
	}

	pdf.SetXY(x+5, y)
	pdf.SetFont("Helvetica", "", 8.5)
	pdf.SetTextColor(105, 105, 110)
	pdf.CellFormat(
		30,
		6,
		label,
		"",
		0,
		"L",
		false,
		0,
		"",
	)

	pdf.SetFont("Helvetica", "B", 8.5)
	pdf.SetTextColor(35, 35, 38)
	pdf.CellFormat(
		width-40,
		6,
		value,
		"",
		0,
		"R",
		false,
		0,
		"",
	)
}

func drawClosingNote(
	pdf *gofpdf.Fpdf,
) {
	if pdf.GetY() > 255 {
		pdf.AddPage()
		pdf.SetY(35)
	}

	y := pdf.GetY()

	pdf.SetFillColor(252, 247, 248)
	pdf.SetDrawColor(240, 210, 218)
	pdf.Rect(
		15,
		y,
		180,
		21,
		"DF",
	)

	pdf.SetXY(20, y+4)
	pdf.SetFont("Helvetica", "B", 8.5)
	pdf.SetTextColor(130, 0, 30)
	pdf.CellFormat(
		170,
		5,
		"Terima kasih telah berbelanja di AnimCommerce.",
		"",
		1,
		"L",
		false,
		0,
		"",
	)

	pdf.SetX(20)
	pdf.SetFont("Helvetica", "", 7.5)
	pdf.SetTextColor(115, 75, 85)
	pdf.MultiCell(
		170,
		4,
		"Invoice ini dibuat secara otomatis dan dapat diverifikasi melalui halaman pesanan AnimCommerce.",
		"",
		"L",
		false,
	)
}

func formatIDR(amount int64) string {
	negative := amount < 0

	if negative {
		amount = -amount
	}

	value := strconv.FormatInt(
		amount,
		10,
	)

	for index := len(value) - 3; index > 0; index -= 3 {
		value =
			value[:index] +
				"." +
				value[index:]
	}

	if negative {
		return "-Rp " + value
	}

	return "Rp " + value
}

func formatShipping(amount int64) string {
	if amount == 0 {
		return "Gratis"
	}

	return formatIDR(amount)
}

func orderStatusLabel(status string) string {
	switch status {
	case "pending":
		return "Menunggu"
	case "processing":
		return "Diproses"
	case "completed":
		return "Selesai"
	case "cancelled":
		return "Dibatalkan"
	default:
		return status
	}
}

func paymentStatusLabel(status string) string {
	switch status {
	case "pending":
		return "Belum dibayar"
	case "success":
		return "Lunas"
	case "failed":
		return "Gagal"
	case "expired":
		return "Kedaluwarsa"
	case "cancelled":
		return "Dibatalkan"
	default:
		return status
	}
}

func orderStatusColor(
	status string,
) (int, int, int) {
	switch status {
	case "processing":
		return 37, 99, 235
	case "completed":
		return 5, 150, 105
	case "cancelled":
		return 225, 29, 72
	default:
		return 217, 119, 6
	}
}

func joinNonEmpty(
	separator string,
	values ...string,
) string {
	filtered := make([]string, 0)

	for _, value := range values {
		value = strings.TrimSpace(value)

		if value != "" {
			filtered = append(
				filtered,
				value,
			)
		}
	}

	return strings.Join(
		filtered,
		separator,
	)
}
