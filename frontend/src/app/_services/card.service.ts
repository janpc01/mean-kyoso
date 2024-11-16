import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private baseUrl = 'http://localhost:8080/api/cards'; // Backend API URL

  constructor(private http: HttpClient) {}

  // Helper method to create headers with the token
  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': token, // Add token to headers
    });
  }

  // Get all cards for a specific user
  getUserCards(userId: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.get(`${this.baseUrl}/user/${userId}`, { headers });
  }

  // Create a new card
  createCard(card: any, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(this.baseUrl, card, { headers });
  }

  // Update a card
  updateCard(cardId: string, card: any, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.put(`${this.baseUrl}/${cardId}`, card, { headers });
  }

  // Increment print count
  incrementPrintCount(cardId: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.put(`${this.baseUrl}/${cardId}/print`, {}, { headers });
  }

  // Delete a card
  deleteCard(cardId: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.delete(`${this.baseUrl}/${cardId}`, { headers });
  }
}
