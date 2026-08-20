package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimitEntry struct {
	count       int
	windowStart time.Time
}

func RateLimit(maxRequests int, window time.Duration) gin.HandlerFunc {
	var mu sync.Mutex
	entries := make(map[string]rateLimitEntry)

	return func(c *gin.Context) {
		now := time.Now()
		key := c.ClientIP() + ":" + c.FullPath()

		mu.Lock()
		entry := entries[key]
		if entry.windowStart.IsZero() || now.Sub(entry.windowStart) >= window {
			entry = rateLimitEntry{windowStart: now}
		}

		entry.count++
		entries[key] = entry
		blocked := entry.count > maxRequests
		mu.Unlock()

		if blocked {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"message": "Too many requests. Please try again later.",
			})
			return
		}

		c.Next()
	}
}
