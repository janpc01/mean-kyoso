import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, firstValueFrom } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payment`;
  private stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-payment-intent`, 
      { amount, email }, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  async getStripe() {
    return await this.stripePromise;
  }
}