import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private baseUrl = 'http://localhost:8080/api/cards'; // Update as needed

  constructor(private http: HttpClient) {}

  // Get all cards for a specific user
  getUserCards(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  // Create a new card
  createCard(card: any): Observable<any> {
    return this.http.post(this.baseUrl, card);
  }

  // Update a card
  updateCard(cardId: string, card: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${cardId}`, card);
  }

  // Increment print count
  incrementPrintCount(cardId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${cardId}/print`, {});
  }

  // Delete a card
  deleteCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${cardId}`);
  }
}
