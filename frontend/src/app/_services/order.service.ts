import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  cardId: string;
  quantity: number;
  card: {
    name: string;
    image: string;
    price: number;
    beltRank: string;
    achievement: string;
    clubName: string;
  };
}

export interface Order {
  _id?: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private authHttpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true
  };

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  // Public endpoints - no auth needed
  createOrder(orderItems: any[], shippingAddress: any, totalAmount: number, paymentDetails: any): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, {
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentDetails
    }, this.httpOptions);
  }

  getOrderById(orderId: string): Observable<Order> {
    console.log('Getting order with ID:', orderId);
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Order service received response:', response),
        error: (error) => {
          console.error('Order service error:', error);
          throw error;
        }
      })
    );
  }

  // Protected endpoints - auth required
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user`, this.authHttpOptions);
  }

  updateOrderStatus(orderId: string, orderStatus: Order['orderStatus']): Observable<Order> {
    return this.http.patch<Order>(
      `${this.baseUrl}/${orderId}/status`,
      { status: orderStatus },
      this.authHttpOptions
    );
  }

  getOrderByPaymentIntent(paymentIntentId: string): Observable<Order> {
    console.log('Getting order by payment intent:', paymentIntentId);
    return this.http.get<Order>(`${this.baseUrl}/payment/${paymentIntentId}`, this.httpOptions).pipe(
      tap({
        next: (response) => console.log('Order service received response:', response),
        error: (error) => {
          console.error('Order service error:', error);
          throw error;
        }
      })
    );
  }
}
