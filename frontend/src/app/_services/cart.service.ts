import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  cardId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    // Load cart from localStorage on initialization
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(card: any): void {
    const existingItem = this.cartItems.find(item => item.cardId === card._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        cardId: card._id,
        name: card.name,
        image: card.image,
        quantity: 1,
        price: 2.99 // Set your default price
      });
    }
    
    this.updateCart();
  }

  removeFromCart(cardId: string): void {
    this.cartItems = this.cartItems.filter(item => item.cardId !== cardId);
    this.updateCart();
  }

  updateQuantity(cardId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.cardId === cardId);
    if (item) {
      item.quantity = quantity;
      this.updateCart();
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  private updateCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}