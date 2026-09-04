package service

import (
	"context"
	"errors"
	"fmt"
	"time"
)

type OrderExpiryBatchResult struct {
	Found   int `json:"found"`
	Expired int `json:"expired"`
	Skipped int `json:"skipped"`
	Failed  int `json:"failed"`
}

func (s *orderService) ExpirePendingOrder(ctx context.Context, now time.Time, limit int) (OrderExpiryBatchResult, error) {
	var result OrderExpiryBatchResult
	if ctx == nil {
		return result, errors.New("Context tidak boleh nil")
	}

	if s.orderRepo == nil {
		return result, errors.New("Order repository belum tersedia")
	}

	orderIDs, err := s.orderRepo.FindExpiredPendingOrderIDs(ctx, now, limit)
	if err != nil {
		return result, fmt.Errorf("gagal mencari expired order: %w", err)
	}

	result.Found = len(orderIDs)
	var processingErrors []error
	for _, orderID := range orderIDs {
		// Hentikan batch jika aplikasi sedang shutdown
		// atau context melewati deadline.
		if err := ctx.Err(); err != nil {
			return result, fmt.Errorf("pemrosesan expiry dihentikan: %w", err)
		}

		expired, err := s.ExpireOrder(ctx, orderID, now)
		if err != nil {
			result.Failed++
			processingErrors = append(processingErrors, fmt.Errorf("order %d gagal diproses: %w", orderID, err))
			continue
		}

		if expired {
			result.Expired++
		} else {
			result.Skipped++
		}
	}

	if len(processingErrors) > 0 {
		return result, errors.Join(processingErrors...)
	}

	return result, err
}
