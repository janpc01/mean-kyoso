import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payment`;
  private stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getUser()?.accessToken;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-access-token': token || ''
    });
  }

  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
    const headers = this.getHeaders();
    return this.http.post<{ clientSecret: string }>(
      `${this.baseUrl}/create-payment-intent`,
      { amount },
      { headers }
    );
  }

  async getStripe() {
    return await this.stripePromise;
  }
}