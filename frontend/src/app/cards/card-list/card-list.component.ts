import { Component, OnInit } from '@angular/core';
import { CardService } from '../../_services/card.service';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';
import { CartService } from '../../_services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {
  cards: any[] = [];
  showDeleteModal = false;
  cardToDelete: any = null;

  constructor(
    private cardService: CardService, 
    private authService: AuthService,
    private storageService: StorageService,
    private cartService: CartService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.authService.verify();
      const user = this.storageService.getUser();
      
      if (!user || !user.id) {
        await this.router.navigate(['/login']);
        return;
      }

      try {
        this.cards = await this.cardService.getUserCards(user.id);
      } catch (err: any) {
        console.error('Error fetching cards:', err);
        if (err.status === 401) {
          await this.router.navigate(['/login']);
        }
      }
    } catch (err) {
      await this.router.navigate(['/login']);
    }
  }

  async deleteCard(cardId: string): Promise<void> {
    try {
      await this.cardService.deleteCard(cardId);
      this.cards = this.cards.filter((card) => card._id !== cardId);
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  }

  addToCart(card: any): void {
    this.cartService.addToCart(card);
    this.router.navigate(['/cart']);
  }

  openDeleteModal(card: any): void {
    this.cardToDelete = card;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.cardToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.cardToDelete) {
      await this.deleteCard(this.cardToDelete._id);
      this.closeDeleteModal();
    }
  }
}
