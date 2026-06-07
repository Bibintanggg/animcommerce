package enum

type StatusOrder string

const (
	OrderPending    StatusOrder = "pending"
	OrderProcessing StatusOrder = "processing"
	OrderCancelled  StatusOrder = "cancelled"
	OrderCompleted  StatusOrder = "completed"
)
