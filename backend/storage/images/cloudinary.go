package images

import (
	"context"
	"mime/multipart"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type cloudinaryStorage struct {
	client *cloudinary.Cloudinary
}

func NewCloudinaryStorage(
	client *cloudinary.Cloudinary,
) Storage {
	return &cloudinaryStorage{
		client: client,
	}
}

func (s *cloudinaryStorage) Upload(
	file multipart.File,
	filename string,
) (string, string, error) {
	baseName := strings.TrimSuffix(
		filepath.Base(filename),
		filepath.Ext(filename),
	)

	publicID :=
		strconv.FormatInt(time.Now().UnixNano(), 10) +
			"_" +
			baseName

	result, err := s.client.Upload.Upload(
		context.Background(),
		file,
		uploader.UploadParams{
			Folder:       "animcommerce/products",
			PublicID:     publicID,
			ResourceType: "image",
		},
	)

	if err != nil {
		return "", "", err
	}

	return result.SecureURL, result.PublicID, nil
}

func (s *cloudinaryStorage) Delete(
	publicID string,
) error {
	_, err := s.client.Upload.Destroy(
		context.Background(),
		uploader.DestroyParams{
			PublicID: publicID,
		},
	)

	return err
}
