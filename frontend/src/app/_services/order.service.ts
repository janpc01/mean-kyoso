import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

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
  card?: {
    name: string;
    image: string;
    price: number;
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
  private baseUrl = 'http://localhost:8080/api/orders';

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

  createOrder(orderItems: any[], shippingAddress: any, totalAmount: number, paymentDetails: any): Observable<Order> {
    const headers = this.getHeaders();
    return this.http.post<Order>(this.baseUrl, {
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentDetails
    }, { headers });
  }

  getUserOrders(): Observable<Order[]> {
    const headers = this.getHeaders();
    return this.http.get<Order[]>(this.baseUrl, { headers });
  }

  getOrderById(orderId: string): Observable<Order> {
    const headers = this.getHeaders();
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`, { headers });
  }

  updateOrderStatus(orderId: string, orderStatus: Order['orderStatus']): Observable<Order> {
    const headers = this.getHeaders();
    return this.http.put<Order>(`${this.baseUrl}/${orderId}/status`, { orderStatus }, { headers });
  }
}