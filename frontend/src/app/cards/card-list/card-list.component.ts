import { Component, OnInit } from '@angular/core';
import { CardService } from '../../_services/card.service';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {
  cards: any[] = [];

  constructor(
    private cardService: CardService, 
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found. User not authenticated.');
      return;
    }

    const user = this.storageService.getUser();
    if (!user || !user.id) {
      console.error('No user ID found.');
      return;
    }

    console.log('Attempting to fetch cards for user:', user.id);

    this.cardService.getUserCards(user.id, token).subscribe({
      next: (data) => {
        console.log('Cards received:', data); // Add this for debugging
        this.cards = data;
      },
      error: (err) => {
        console.error('Error fetching cards:', err);
        if (err.error && err.error.message) {
          console.error('Server error message:', err.error.message);
        }
      },
    });
  }

  deleteCard(cardId: string): void {
    const token = this.authService.getToken(); // Retrieve token
    if (!token) {
      console.error('No token found. User not authenticated.');
      return;
    }

    this.cardService.deleteCard(cardId, token).subscribe({
      next: () => {
        this.cards = this.cards.filter((card) => card._id !== cardId);
      },
      error: (err) => console.error('Error deleting card:', err),
    });
  }

  incrementPrint(cardId: string): void {
    const token = this.authService.getToken(); // Retrieve token
    if (!token) {
      console.error('No token found. User not authenticated.');
      return;
    }

    this.cardService.incrementPrintCount(cardId, token).subscribe({
      next: (updatedCard) => {
        const index = this.cards.findIndex((card) => card._id === cardId);
        if (index !== -1) this.cards[index] = updatedCard.card;
      },
      error: (err) => console.error('Error incrementing print count:', err),
    });
  }
}
