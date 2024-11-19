import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, firstValueFrom } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payment`;
  private stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createPaymentIntent(amount: number, email: string): Observable<any> {
    return from(this.getOrCreateToken(email)).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'x-access-token': token
        });

        return this.http.post(`${this.baseUrl}/create-payment-intent`, 
          { amount, email, isGuest: token.startsWith('guest_') }, 
          { headers }
        );
      })
    );
  }

  private async getOrCreateToken(email: string): Promise<string> {
    const token = this.authService.getToken();
    
    if (!token) {
      localStorage.setItem('guestEmail', email);
      const response = await firstValueFrom(this.authService.generateGuestToken());
      return response.token;
    }
    
    return token;
  }

  async getStripe() {
    return await this.stripePromise;
  }
}