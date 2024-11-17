import { Component } from '@angular/core';
import { CardService } from '../_services/card.service';
import { Router } from '@angular/router';
import { CartService } from '../_services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  searchQuery: string = '';
  searchResults: any[] = [];
  searchTimeout: any;

  constructor(
    private cardService: CardService,
    private cartService: CartService,
    private router: Router
  ) {}

  onSearch(): void {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout to prevent too many API calls
    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim()) {
        this.searchCards();
      } else {
        this.searchResults = []; // Clear results when search is empty
      }
    }, 300);
  }

  private searchCards(): void {
    this.cardService.searchCards(this.searchQuery).subscribe({
      next: (data) => {
        this.searchResults = data;
      },
      error: (err) => {
        console.error('Error searching cards:', err);
      }
    });
  }

  addToCart(card: any): void {
    this.cartService.addToCart(card);
    this.router.navigate(['/cart']);
  }
}