package dto

type RegisterFCMDeviceRequest struct {
	InstallationID string `json:"installation_id" binding:"required"`
	UserAgent      string `json:"user_agent"`
}
