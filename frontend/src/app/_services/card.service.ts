import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private baseUrl = 'http://localhost:8080/api/cards';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  async getUserCards(userId: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/user/${userId}`, this.httpOptions)
    );
  }

  async createCard(card: any): Promise<any> {
    return firstValueFrom(
      this.http.post(this.baseUrl, card, this.httpOptions)
    );
  }

  async updateCard(cardId: string, card: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}/${cardId}`, card, this.httpOptions)
    );
  }

  async deleteCard(cardId: string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}/${cardId}`, this.httpOptions)
    );
  }

  async incrementPrintCount(cardId: string): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.baseUrl}/${cardId}/print`, {}, this.httpOptions)
    );
  }

  async getAllCards(): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/all`)
    );
  }

  async searchCards(query: string): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/search?q=${query}`)
    );
  }
}
