import { Component } from '@angular/core';
import { CardService } from '../_services/card.service';
import { Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { CardCreateComponent } from '../cards/card-create/card-create.component';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  searchQuery: string = '';
  searchResults: any[] = [];
  searchTimeout: any;
  isLoggedIn = false;

  constructor(
    private cardService: CardService,
    private cartService: CartService,
    private router: Router,
    private storageService: StorageService
  ) {
    this.isLoggedIn = this.storageService.isLoggedIn();
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim()) {
        this.searchCards();
      } else {
        this.searchResults = [];
      }
    }, 300);
  }

  private async searchCards(): Promise<void> {
    try {
      const rawResults = await this.cardService.searchCards(this.searchQuery);
      this.searchResults = rawResults.map((card: any) => ({
        ...card,
        image: card.image.startsWith('data:image') 
          ? card.image 
          : `data:image/jpeg;base64,${card.image}`
      }));
    } catch (err) {
      console.error('Error searching cards:', err);
      this.searchResults = [];
    }
  }

  addToCart(card: any): void {
    this.cartService.addToCart(card);
    this.router.navigate(['/cart']);
  }
}