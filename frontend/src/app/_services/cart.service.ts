import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

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
  private readonly MAX_ITEMS = 20; // Maximum number of items in cart

  constructor(private storageService: StorageService) {
    this.loadCart();
  }

  private getStorageKey(): string {
    const user = this.storageService.getUser();
    return user ? `cart-${user.id}` : 'cart-guest';
  }

  private loadCart(): void {
    try {
      const storageKey = this.getStorageKey();
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next(this.cartItems);
      } else {
        this.cartItems = [];
        this.cartSubject.next(this.cartItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cartItems = [];
      this.cartSubject.next(this.cartItems);
    }
  }

  private updateCart(): void {
    try {
      // Limit cart size
      if (this.cartItems.length > this.MAX_ITEMS) {
        this.cartItems = this.cartItems.slice(0, this.MAX_ITEMS);
      }

      // Try to save to localStorage
      const storageKey = this.getStorageKey();
      const cartString = JSON.stringify(this.cartItems);
      
      try {
        localStorage.setItem(storageKey, cartString);
      } catch (e) {
        // If storage is full, clear old carts and try again
        this.clearOldCarts();
        localStorage.setItem(storageKey, cartString);
      }
      
      this.cartSubject.next(this.cartItems);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  private clearOldCarts(): void {
    try {
      const currentKey = this.getStorageKey();
      const keysToRemove = [];
      
      // Collect all cart keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cart-') && key !== currentKey) {
          keysToRemove.push(key);
        }
      }
      
      // Remove old carts
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // If still can't save, clear current cart
      if (this.cartItems.length > 5) {
        this.cartItems = this.cartItems.slice(-5);
      }
    } catch (error) {
      console.error('Error clearing old carts:', error);
      this.cartItems = [];
    }
  }

  getCart(): Observable<CartItem[]> {
    this.loadCart(); // Reload cart on each get to ensure we have the correct data
    return this.cartSubject.asObservable();
  }

  addToCart(card: any): void {
    const existingItem = this.cartItems.find(item => item.cardId === card._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Extract just the necessary data and truncate image URL if too long
      const imageUrl = card.image.length > 200 ? card.image.substring(0, 200) : card.image;
      
      this.cartItems.push({
        cardId: card._id,
        name: card.name.substring(0, 50), // Limit name length
        image: imageUrl,
        quantity: 1,
        price: card.price
      });
    }
    
    // Remove items if we exceed MAX_ITEMS
    if (this.cartItems.length > this.MAX_ITEMS) {
      this.cartItems = this.cartItems.slice(-this.MAX_ITEMS);
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

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}