package images

import "mime/multipart"

type Storage interface {
	Upload(file multipart.File, filename string) (secureURL string, publicID string, err error)
	Delete(publicID string) error
}
