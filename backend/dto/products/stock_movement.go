package dto

type StockMovementResponse struct {
	Date  string `json:"date"`
	Stock int    `json:"stock"`
	Value int    `json:"value"`
}
