package service

import (
	"animcommerce/backend/models"
	"animcommerce/backend/repository"
	"errors"
)

type CartService interface {
	AddToCart(userID int64, productID int64, quantity int) error
	GetCart(userID int64) ([]models.CartProduct, error)
	UpdateQuantity(userID int64, productID int64, quantity int) error
	RemoveItem(userID int64, productID int64) error
}

type cartService struct {
	repo repository.CartRepository
}

func NewCartService(repo repository.CartRepository) CartService {
	return &cartService{
		repo: repo,
	}
}

func (s *cartService) AddToCart(userID int64, productID int64, quantity int) error {
	if quantity <= 0 {
		return errors.New("Quantity must be greater than 0")
	}

	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil || cart.ID == 0 {
		cart = models.Cart{
			UserID: userID,
		}

		err := s.repo.CreateCart(&cart)
		if err != nil {
			return err
		}
	}

	cart, err = s.repo.GetCartByUserID(userID)
	if err != nil {
		return nil
	}

	cartID := cart.ID

	item, err := s.repo.FindItem(cartID, productID)
	if err == nil {
		item.Quantity += quantity
		return s.repo.UpdateItem(&item)
	}

	newItem := models.CartProduct{
		CartID:    cartID,
		ProductID: productID,
		Quantity:  quantity,
	}

	return s.repo.CreateItem(&newItem)
}

func (s *cartService) GetCart(userID int64) ([]models.CartProduct, error) {
	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil {
		return nil, err
	}

	cartProducts, err := s.repo.GetCartItems(cart.ID)
	if err != nil {
		return nil, err
	}

	return cartProducts, nil
}

func (s *cartService) UpdateQuantity(userID int64, productID int64, quantity int) error {
	if quantity <= 0 {
		return errors.New("Quantity must be greater than 0")

	}

	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil {
		return err
	}

	item, err := s.repo.FindItem(cart.ID, productID)
	if err != nil {
		return err
	}

	item.Quantity = int(quantity)
	return s.repo.UpdateItem(&item)
}

func (s *cartService) RemoveItem(userID int64, productID int64) error {
	cart, err := s.repo.GetCartByUserID(userID)
	if err != nil {
		return err
	}

	return s.repo.DeleteItem(cart.ID, productID)
}
