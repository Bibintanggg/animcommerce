package enum

type StockMovementType string

const (
	StockIn         StockMovementType = "in"
	StockOut        StockMovementType = "out"
	StockAdjustment StockMovementType = "adjustment"
)
