package dto

type RecentActivityResponse struct {
	ID     int64  `json:"id"`
	User   string `json:"user"`
	Type   string `json:"type"`
	Detail string `json:"detail"`
	Time   string `json:"time"`
}
