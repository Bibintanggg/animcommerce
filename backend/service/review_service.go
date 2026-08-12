package service

import (
	"errors"

	dto "animcommerce/backend/dto/review"
	"animcommerce/backend/models"
	"animcommerce/backend/repository"

	"gorm.io/gorm"
)

var (
	ErrReviewNotFound      = errors.New("review not found")
	ErrReviewAlreadyExists = errors.New("you already reviewed this product")
	ErrUnauthorizedReview  = errors.New("you are not allowed to modify this review")
)

type ReviewService interface {
	CreateReview(review *models.Review) error

	GetProductReviews(productID int64) ([]models.Review, error)

	GetReview(id int64) (models.Review, error)

	UpdateReview(
		userID int64,
		reviewID int64,
		rating int,
		comment string,
	) (models.Review, error)

	DeleteReview(
		userID int64,
		reviewID int64,
	) error

	GetAllReviews(
		filter dto.ReviewFilter,
	) ([]models.Review, int64, error)

	GetReviewSummary() (
		repository.ReviewSummary,
		error,
	)
}

type reviewService struct {
	reviewRepository repository.ReviewRepository
}

func NewReviewService(
	reviewRepository repository.ReviewRepository,
) ReviewService {
	return &reviewService{
		reviewRepository: reviewRepository,
	}
}

func (s *reviewService) CreateReview(
	review *models.Review,
) error {

	// Cek apakah user sudah pernah review produk ini
	existing, err := s.reviewRepository.FindByUserAndProduct(
		review.UserID,
		review.ProductID,
	)

	if err == nil && existing.ID != 0 {
		return ErrReviewAlreadyExists
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return s.reviewRepository.Create(review)
}

func (s *reviewService) GetProductReviews(
	productID int64,
) ([]models.Review, error) {

	return s.reviewRepository.FindByProductID(productID)
}

func (s *reviewService) GetReview(
	id int64,
) (models.Review, error) {

	review, err := s.reviewRepository.FindByID(id)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Review{}, ErrReviewNotFound
	}

	return review, err
}

func (s *reviewService) UpdateReview(
	userID int64,
	reviewID int64,
	rating int,
	comment string,
) (models.Review, error) {

	review, err := s.reviewRepository.FindByID(reviewID)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Review{}, ErrReviewNotFound
	}

	if err != nil {
		return models.Review{}, err
	}

	if review.UserID != userID {
		return models.Review{}, ErrUnauthorizedReview
	}

	review.Rating = rating
	review.Comment = comment

	if err := s.reviewRepository.Update(&review); err != nil {
		return models.Review{}, err
	}

	return review, nil
}

func (s *reviewService) DeleteReview(
	userID int64,
	reviewID int64,
) error {

	review, err := s.reviewRepository.FindByID(reviewID)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrReviewNotFound
	}

	if err != nil {
		return err
	}

	if review.UserID != userID {
		return ErrUnauthorizedReview
	}

	return s.reviewRepository.Delete(&review)
}

func (s *reviewService) GetAllReviews(
	filter dto.ReviewFilter,
) ([]models.Review, int64, error) {

	if filter.Page < 1 {
		filter.Page = 1
	}

	if filter.Limit < 1 {
		filter.Limit = 10
	}

	if filter.Limit > 100 {
		filter.Limit = 100
	}

	return s.reviewRepository.FindAll(filter)
}

func (s *reviewService) GetReviewSummary() (
	repository.ReviewSummary,
	error,
) {

	return s.reviewRepository.GetSummary()
}
