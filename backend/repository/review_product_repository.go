package repository

import (
	dto "animcommerce/backend/dto/review"
	"animcommerce/backend/models"

	"gorm.io/gorm"
)

type ReviewSummary struct {
	TotalReviews  int64   `json:"total_reviews"`
	AverageRating float64 `json:"average_rating"`

	Rating5 int64 `json:"rating_5"`
	Rating4 int64 `json:"rating_4"`
	Rating3 int64 `json:"rating_3"`
	Rating2 int64 `json:"rating_2"`
	Rating1 int64 `json:"rating_1"`
}

type ReviewRepository interface {
	Create(review *models.Review) error

	FindByProductID(productID int64) ([]models.Review, error)
	FindByID(id int64) (models.Review, error)

	FindByUserAndProduct(
		userID int64,
		productID int64,
	) (models.Review, error)

	Update(review *models.Review) error
	Delete(review *models.Review) error

	FindAll(
		filter dto.ReviewFilter,
	) ([]models.Review, int64, error)

	GetSummary() (ReviewSummary, error)
}

type reviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{
		db: db,
	}
}

func (r *reviewRepository) Create(
	review *models.Review,
) error {
	return r.db.Create(review).Error
}

func (r *reviewRepository) FindByProductID(
	productID int64,
) ([]models.Review, error) {

	var reviews []models.Review

	err := r.db.
		Preload("User").
		Where("product_id = ?", productID).
		Order("created_at DESC").
		Find(&reviews).
		Error

	return reviews, err
}

func (r *reviewRepository) FindByID(
	id int64,
) (models.Review, error) {

	var review models.Review

	err := r.db.
		Preload("User").
		Preload("Product").
		First(&review, id).
		Error

	return review, err
}

func (r *reviewRepository) FindByUserAndProduct(
	userID int64,
	productID int64,
) (models.Review, error) {

	var review models.Review

	err := r.db.
		Where(
			"user_id = ? AND product_id = ?",
			userID,
			productID,
		).
		First(&review).
		Error

	return review, err
}

func (r *reviewRepository) Update(
	review *models.Review,
) error {
	return r.db.Save(review).Error
}

func (r *reviewRepository) Delete(
	review *models.Review,
) error {
	return r.db.Delete(review).Error
}

func (r *reviewRepository) FindAll(
	filter dto.ReviewFilter,
) ([]models.Review, int64, error) {

	var reviews []models.Review
	var total int64

	query := r.db.
		Model(&models.Review{}).
		Preload("Product").
		Preload("User")

	if filter.Search != "" {
		query = query.
			Joins(
				"JOIN products ON products.id = reviews.product_id",
			).
			Where(
				"products.title LIKE ?",
				"%"+filter.Search+"%",
			)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("reviews.created_at DESC").
		Offset((filter.Page - 1) * filter.Limit).
		Limit(filter.Limit).
		Find(&reviews).
		Error

	return reviews, total, err
}

func (r *reviewRepository) GetSummary() (
	ReviewSummary,
	error,
) {

	var summary ReviewSummary

	err := r.db.
		Model(&models.Review{}).
		Select(`
			COUNT(*) AS total_reviews,
			COALESCE(AVG(rating), 0) AS average_rating,
			COUNT(CASE WHEN rating = 5 THEN 1 END) AS rating_5,
			COUNT(CASE WHEN rating = 4 THEN 1 END) AS rating_4,
			COUNT(CASE WHEN rating = 3 THEN 1 END) AS rating_3,
			COUNT(CASE WHEN rating = 2 THEN 1 END) AS rating_2,
			COUNT(CASE WHEN rating = 1 THEN 1 END) AS rating_1
		`).
		Scan(&summary).
		Error

	return summary, err
}
