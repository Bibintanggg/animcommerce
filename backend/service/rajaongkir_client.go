package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type ShippingDestination struct {
	ID              int64  `json:"id"`
	Label           string `json:"label"`
	ProvinceName    string `json:"province_name"`
	CityName        string `json:"city_name"`
	DistrictName    string `json:"district_name"`
	SubdistrictName string `json:"subdistrict_name"`
	ZipCode         string `json:"zip_code"`
}

type ShippingOption struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	Service     string `json:"service"`
	Description string `json:"description"`
	Cost        int64  `json:"cost"`
	ETD         string `json:"etd"`
}

type CalculateShippingInput struct {
	OriginID      int64
	DestinationID int64
	Weight        int64
	Couriers      string
}

type rajaOngkirMeta struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
	Status  string `json:"status"`
}

type destinationResponse struct {
	Meta rajaOngkirMeta        `json:"meta"`
	Data []ShippingDestination `json:"data"`
}

type shippingCostResponse struct {
	Meta rajaOngkirMeta   `json:"meta"`
	Data []ShippingOption `json:"data"`
}

type RajaOngkirClient struct {
	baseURL    string
	apiKey     string
	originID   int64
	httpClient *http.Client
}

func NewRajaOngkirClient() (*RajaOngkirClient, error) {
	originID, err := strconv.ParseInt(strings.TrimSpace(os.Getenv("RAJAONGKIR_ORIGIN_ID")), 10, 64)
	if err != nil || originID <= 0 {
		return nil, errors.New("RAJAONGKIR_ORIGIN_ID tidak valid")
	}
	apiKey := strings.TrimSpace(
		os.Getenv("RAJAONGKIR_API_KEY"),
	)
	if apiKey == "" {
		return nil, errors.New(
			"RAJAONGKIR_API_KEY wajib diisi",
		)
	}

	baseURL := strings.TrimSpace(
		os.Getenv("RAJAONGKIR_BASE_URL"),
	)
	if baseURL == "" {
		baseURL = "https://rajaongkir.komerce.id/api/v1"
	}

	return &RajaOngkirClient{
		baseURL:  strings.TrimRight(baseURL, "/"),
		originID: originID,
		apiKey:   apiKey,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}, nil
}
func (c *RajaOngkirClient) execute(
	ctx context.Context,
	method string,
	endpoint string,
	body io.Reader,
	contentType string,
	output any,
) error {
	request, err := http.NewRequestWithContext(
		ctx, method, c.baseURL+endpoint, body,
	)
	if err != nil {
		return fmt.Errorf("gagal memuat request rajaongkir: %w", err)
	}

	request.Header.Set("Accept", "application/json")
	request.Header.Set("key", c.apiKey)

	if contentType != "" {
		request.Header.Set("Content-Type", contentType)
	}

	response, err := c.httpClient.Do(request)
	if err != nil {
		return fmt.Errorf("gagal menghubungi RajaOngkir: %w", err)
	}

	defer response.Body.Close()

	payload, err := io.ReadAll(
		io.LimitReader(response.Body, 1<<20),
	)
	if err != nil {
		return fmt.Errorf(
			"gagal membaca respons RajaOngkir: %w",
			err,
		)
	}

	if response.StatusCode < 200 ||
		response.StatusCode >= 300 {
		return fmt.Errorf(
			"RajaOngkir mengembalikan HTTP %d: %s",
			response.StatusCode,
			strings.TrimSpace(string(payload)),
		)
	}

	if err := json.Unmarshal(payload, output); err != nil {
		return fmt.Errorf(
			"respons RajaOngkir tidak valid: %w",
			err,
		)
	}

	return nil
}

func (c *RajaOngkirClient) SearchDestinations(ctx context.Context, search string) ([]ShippingDestination, error) {
	search = strings.TrimSpace(search)
	if len(search) < 3 {
		return nil, errors.New("pencarian lokasi minimal 3 karakter")
	}

	query := url.Values{}
	query.Set("search", search)
	query.Set("limit", "10")
	query.Set("offset", "0")

	var response destinationResponse

	err := c.execute(
		ctx,
		http.MethodGet,
		"/destination/domestic-destination?"+query.Encode(),
		nil,
		"",
		&response,
	)

	if err != nil {
		return nil, err
	}

	if response.Meta.Code != http.StatusOK {
		return nil, errors.New(response.Meta.Message)
	}

	return response.Data, nil
}

func (c *RajaOngkirClient) CalculateDomesticCost(ctx context.Context, input CalculateShippingInput) ([]ShippingOption, error) {
	if input.OriginID <= 0 || input.DestinationID <= 0 || input.Weight <= 0 {
		return nil, errors.New("parameter perhitungan ongkir tidak valid")
	}

	couriers := strings.TrimSpace(input.Couriers)
	if couriers == "" {
		couriers = "jne:sicepat:jnt:tiki:anteraja"
	}

	form := url.Values{}
	form.Set("origin", strconv.FormatInt(input.OriginID, 10))
	form.Set(
		"destination",
		strconv.FormatInt(input.DestinationID, 10),
	)
	form.Set("weight", strconv.FormatInt(input.Weight, 10))
	form.Set("courier", couriers)

	var response shippingCostResponse

	err := c.execute(
		ctx,
		http.MethodPost,
		"/calculate/domestic-cost",
		bytes.NewBufferString(form.Encode()),
		"application/x-www-form-urlencoded",
		&response,
	)
	if err != nil {
		return nil, err
	}

	if response.Meta.Code != http.StatusOK {
		return nil, errors.New(response.Meta.Message)
	}

	return response.Data, nil
}
