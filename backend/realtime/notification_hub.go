package realtime

import (
	"sync"
	"time"
)

type NotificationEvent struct {
	ID        int64     `json:"id"`
	OrderID   *int64    `json:"order_id,omitempty"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

type NotificationHub struct {
	mu      sync.RWMutex
	clients map[int64]map[chan NotificationEvent]struct{}
}

func NewNotificationHub() *NotificationHub {
	return &NotificationHub{
		clients: make(map[int64]map[chan NotificationEvent]struct{}),
	}
}

func (h *NotificationHub) Subscribe(userID int64) chan NotificationEvent {
	h.mu.Lock()
	defer h.mu.Unlock()
	client := make(chan NotificationEvent, 10)
	if h.clients[userID] == nil {
		h.clients[userID] = make(map[chan NotificationEvent]struct{})
	}
	h.clients[userID][client] = struct{}{}
	return client
}

func (h *NotificationHub) Unsubscribe(userID int64, client chan NotificationEvent) {
	h.mu.Lock()
	defer h.mu.Unlock()
	userClients, exists := h.clients[userID]
	if !exists {
		return
	}

	delete(userClients, client)
	close(client)
	if len(userClients) == 0 {
		delete(h.clients, userID)
	}
}

func (h *NotificationHub) Publish(userID int64, event NotificationEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.clients[userID] {
		select {
		case client <- event:
		default:
		}
	}
}
