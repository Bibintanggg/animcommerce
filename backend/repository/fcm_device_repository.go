package repository

import (
	"animcommerce/backend/models"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type FCMDeviceRepository interface {
	Upsert(
		userID int64,
		installationID string,
		userAgent string,
	) error

	FindStaffInstallationIDs() ([]string, error)

	DeleteByInstallationID(
		installationID string,
	) error
}

type fcmDeviceRepository struct {
	db *gorm.DB
}

func NewFCMDeviceRepository(
	db *gorm.DB,
) FCMDeviceRepository {
	return &fcmDeviceRepository{
		db: db,
	}
}

func (r *fcmDeviceRepository) Upsert(
	userID int64,
	installationID string,
	userAgent string,
) error {
	device := models.FCMDevice{
		UserID:         userID,
		InstallationID: installationID,
		UserAgent:      userAgent,
		LastSeenAt:     time.Now(),
	}

	return r.db.
		Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "installation_id"},
			},
			DoUpdates: clause.Assignments(
				map[string]any{
					"user_id":      userID,
					"user_agent":   userAgent,
					"last_seen_at": time.Now(),
					"updated_at":   time.Now(),
				},
			),
		}).
		Create(&device).
		Error
}

func (
	r *fcmDeviceRepository,
) FindStaffInstallationIDs() (
	[]string,
	error,
) {
	var installationIDs []string

	err := r.db.
		Table("fcm_devices").
		Joins(
			"JOIN users ON users.id = fcm_devices.user_id",
		).
		Where(
			"users.role IN ?",
			[]string{"admin", "superadmin"},
		).
		Pluck(
			"fcm_devices.installation_id",
			&installationIDs,
		).
		Error

	return installationIDs, err
}

func (
	r *fcmDeviceRepository,
) DeleteByInstallationID(
	installationID string,
) error {
	return r.db.
		Where(
			"installation_id = ?",
			installationID,
		).
		Delete(&models.FCMDevice{}).
		Error
}
