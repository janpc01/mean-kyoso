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
    // Get the navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { order: any };
    
    if (state?.order) {
      this.orderDetails = state.order;
      this.orderId = state.order._id;
    }
  }

  ngOnInit(): void {
    // If no state, try query params
    if (!this.orderDetails) {
      this.route.queryParams.subscribe(params => {
        this.orderId = params['orderId'];
        
        if (!this.orderId) {
          // Only redirect if user came here directly
          if (!document.referrer.includes('/checkout')) {
            console.error('No order details found, redirecting to home');
            this.router.navigate(['/']);
            return;
          }
        } else {
          this.loadOrderDetails();
        }
      });
    }
  }

  private loadOrderDetails(): void {
    if (!this.orderId) return;
    
    console.log('Loading order details for ID:', this.orderId);
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
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
