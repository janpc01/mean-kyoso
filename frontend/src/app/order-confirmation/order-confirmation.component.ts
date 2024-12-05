import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../_services/order.service';
import { CartService } from '../_services/cart.service';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  orderDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private location: Location
  ) {
    console.log('OrderConfirmation constructor called');
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { order: any };
    
    console.log('Navigation state:', state);
    
    if (state?.order) {
      console.log('Order found in state:', state.order);
      this.orderDetails = state.order;
      this.orderId = state.order._id;
    } else {
      console.log('No order in state');
    }
  }

  ngOnInit(): void {
    console.log('OrderConfirmation ngOnInit, current details:', {
      orderId: this.orderId,
      orderDetails: this.orderDetails
    });

    if (!this.orderDetails) {
      this.route.queryParams.subscribe(params => {
        console.log('Query params:', params);
        this.orderId = params['orderId'];
        
        if (!this.orderId) {
          console.log('No orderId in params, checking referrer:', document.referrer);
          if (!document.referrer.includes('/checkout')) {
            console.error('No order details found, redirecting to home');
            this.router.navigate(['/']);
            return;
          }
        } else {
          console.log('Found orderId in params, loading details');
          this.loadOrderDetails();
        }
      });
    }
  }

  private loadOrderDetails(): void {
    if (!this.orderId) {
      console.error('Attempted to load details with no orderId');
      return;
    }
    
    console.log('Loading order details for ID:', this.orderId);
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        console.log('Received order details:', order);
        const formattedOrder = {
          ...order,
          items: order.items.map(item => ({
            ...item,
            card: {
              ...item.card,
              image: item.card.image.startsWith('data:image') 
                ? item.card.image 
                : `data:image/jpeg;base64,${item.card.image}`
            }
          }))
        };
        console.log('Formatted order details:', formattedOrder);
        this.orderDetails = formattedOrder;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        if (error.status === 404) {
          this.router.navigate(['/']);
        }
        this.orderDetails = null;
      }
    });
  }
}
