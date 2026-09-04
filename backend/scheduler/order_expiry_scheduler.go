package scheduler

import (
	"animcommerce/backend/service"
	"context"
	"errors"
	"log"
	"time"
)

type OrderExpiryScheduler struct {
	orderService service.OrderService
	interval     time.Duration
	batchSize    int
}

func NewOrderExpiryScheduler(
	orderService service.OrderService,
	interval time.Duration,
	batchSize int,
) (*OrderExpiryScheduler, error) {
	if orderService == nil {
		return nil, errors.New("order service tidak boleh nil")
	}

	if interval <= 0 {
		return nil, errors.New("interval scheduler harus lebih dari nol")
	}

	if batchSize <= 0 || batchSize > 500 {
		return nil, errors.New(
			"batch size harus berada antara 1 sampai 500",
		)
	}

	return &OrderExpiryScheduler{
		orderService: orderService,
		interval:     interval,
		batchSize:    batchSize,
	}, nil
}

func (s *OrderExpiryScheduler) Run(ctx context.Context) {
	if ctx == nil {
		log.Println(
			"order expiry scheduler tidak dijalankan: context nil",
		)
		return
	}

	log.Printf(
		"order expiry scheduler aktif: interval=%s batch_size=%d",
		s.interval,
		s.batchSize,
	)

	// Jalankan sekali saat aplikasi baru menyala.
	s.process(ctx, time.Now())

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("order expiry scheduler dihentikan")
			return

		case now := <-ticker.C:
			// Pemrosesan synchronous mencegah job scheduler
			// saling bertumpuk.
			s.process(ctx, now)
		}
	}
}

func (s *OrderExpiryScheduler) process(
	parentContext context.Context,
	now time.Time,
) {
	jobContext, cancel := context.WithTimeout(
		parentContext,
		45*time.Second,
	)
	defer cancel()

	result, err := s.orderService.ExpirePendingOrder(
		jobContext,
		now,
		s.batchSize,
	)

	if err != nil {
		log.Printf(
			"order expiry scheduler selesai dengan error: found=%d expired=%d skipped=%d failed=%d error=%v",
			result.Found,
			result.Expired,
			result.Skipped,
			result.Failed,
			err,
		)
		return
	}

	if result.Found == 0 {
		return
	}

	log.Printf(
		"order expiry scheduler selesai: found=%d expired=%d skipped=%d failed=%d",
		result.Found,
		result.Expired,
		result.Skipped,
		result.Failed,
	)
}
