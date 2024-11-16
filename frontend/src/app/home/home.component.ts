import { Component, OnInit } from '@angular/core';
import { CardService } from '../_services/card.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  searchTimeout: any;

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    // Load all cards initially
    this.loadAllCards();
  }

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
        this.loadAllCards();
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

  private loadAllCards(): void {
    this.cardService.getAllCards().subscribe({
      next: (data) => {
        this.searchResults = data;
      },
      error: (err) => {
        console.error('Error loading cards:', err);
      }
    });
  }
}