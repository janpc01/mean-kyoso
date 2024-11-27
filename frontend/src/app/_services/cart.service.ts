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
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      this.cartItems = savedCart ? JSON.parse(savedCart) : [];
      this.cartSubject.next(this.cartItems);
    } catch (error) {
      this.cartItems = [];
      this.cartSubject.next(this.cartItems);
    }
  }

  private saveCart(): void {
    try {
      const simplifiedCart = this.cartItems.map(item => ({
        cardId: item.cardId,
        name: item.name,
        image: item.image.substring(0, 100),
        quantity: item.quantity,
        price: item.price
      }));
      
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(simplifiedCart));
      this.cartSubject.next(this.cartItems);
    } catch (error) {
      try {
        localStorage.clear();
        const minimalCart = this.cartItems.map(item => ({
          cardId: item.cardId,
          quantity: item.quantity,
          price: item.price
        }));
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(minimalCart));
      } catch (e) {
      }
    }
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getCartItems(): any[] {
    return this.cartItems;
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
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
        price: card.price
      });
    }
    
    this.saveCart();
  }

  updateQuantity(cardId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.cardId === cardId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeFromCart(cardId: string): void {
    this.cartItems = this.cartItems.filter(item => item.cardId !== cardId);
    this.saveCart();
  }
}