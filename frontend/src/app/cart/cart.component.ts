import { Component, OnInit } from '@angular/core';
import { CartService, CartItem } from '../_services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.cardId, newQuantity);
    }
  }

  removeItem(cardId: string): void {
    this.cartService.removeFromCart(cardId);
  }

  checkout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    // Always proceed to checkout - it will handle guest vs authenticated flow
    this.router.navigate(['/checkout']);
  }
}