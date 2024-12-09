import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

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

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const user = this.storageService.getUser();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(user?.token ? { 'x-access-token': user.token } : {})
    });
  }

  createOrder(orderItems: any[], shippingAddress: any, totalAmount: number, paymentDetails: any): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, {
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentDetails
    });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }

  updateOrderStatus(orderId: string, orderStatus: Order['orderStatus']): Observable<Order> {
    const headers = this.getHeaders();
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, { orderStatus }, { headers });
  }
}