package dto

import "time"

type ReviewResponse struct {
	ID        int64              `json:"id"`
	Rating    int                `json:"rating"`
	Comment   string             `json:"comment"`
	User      ReviewUserResponse `json:"user"`
	CreatedAt time.Time          `json:"created_at"`
}

type ReviewUserResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
