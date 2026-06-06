package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
	"errors"

	"gorm.io/gorm"
)

type CartService interface {
	AddToCart(userID int64, productID int64, quantity int) error
	GetCart(userID int64) ([]models.CartProduct, error)
	UpdateQuantity(userID int64, productID int64, quantity int) error
	RemoveItem(userID int64, productID int64) error
}

type cartService struct {
	cartRepo    repository.CartRepository
	productRepo repository.ProductRepository
}

func NewCartService(cartRepo repository.CartRepository, productRepo repository.ProductRepository) CartService {
	return &cartService{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

func (s *cartService) AddToCart(userID int64, productID int64, quantity int) error {
	if quantity <= 0 {
		return errors.New("Quantity must be greater than 0")
	}

	_, err := s.productRepo.FindByID(productID)
	if err != nil {
		return errors.New("Product not found")
	}

	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newCart := models.Cart{
				UserID: userID,
			}

			err = s.cartRepo.CreateCart(&newCart)
			if err != nil {
				return err
			}

			cart = newCart
		} else {
			return err
		}
	}

	item, err := s.cartRepo.FindItem(cart.ID, productID)
	if err == nil {
		item.Quantity += quantity
		return s.cartRepo.UpdateItem(&item)
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	newItem := models.CartProduct{
		CartID:    cart.ID,
		ProductID: productID,
		Quantity:  quantity,
	}

	return s.cartRepo.CreateItem(&newItem)
}

func (s *cartService) GetCart(userID int64) ([]models.CartProduct, error) {
	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		return nil, err
	}

	items, err := s.cartRepo.GetCartItems(cart.ID)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (s *cartService) UpdateQuantity(userID int64, productID int64, quantity int) error {
	if quantity <= 0 {
		return errors.New("Quantity must be greater than 0")

	}

	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		return err
	}

	item, err := s.cartRepo.FindItem(cart.ID, productID)
	if err != nil {
		return err
	}

	item.Quantity = quantity
	return s.cartRepo.UpdateItem(&item)
}

func (s *cartService) RemoveItem(userID int64, productID int64) error {
	cart, err := s.cartRepo.GetCartByUserID(userID)
	if err != nil {
		return err
	}

	return s.cartRepo.DeleteItem(cart.ID, productID)
}
