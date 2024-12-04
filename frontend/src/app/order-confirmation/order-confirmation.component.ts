import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../_services/order.service';
import { CartService } from '../_services/cart.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html'
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  orderDetails: any = null;
  paymentIntentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // First check for orderId
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      this.paymentIntentId = params['payment_intent'];

      if (this.orderId) {
        this.loadOrderDetails();
      } else if (this.paymentIntentId) {
        // If we have a payment_intent but no orderId, we need to fetch the order by payment intent
        this.orderService.getOrderByPaymentIntent(this.paymentIntentId).subscribe({
          next: (order) => {
            this.orderId = order._id;
            this.loadOrderDetails();
          },
          error: (error) => {
            console.error('Error fetching order by payment intent:', error);
          }
        });
      }
    });
  }

  private loadOrderDetails(): void {
    if (this.orderId) {
      console.log('Attempting to fetch order details...');
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          console.log('Successfully received order details:', order);
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
          console.error('Error loading order details. Full error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error headers:', error.headers);
          console.error('Error URL:', error.url);
          
          if (error.status === 401) {
            console.log('Unauthorized access, redirecting to login...');
            this.router.navigate(['/login']);
          } else if (error.status === 0) {
            console.error('CORS or network error detected');
            // Handle CORS error specifically
            this.orderDetails = null;
          } else {
            console.error('Other error occurred:', error.statusText);
            this.orderDetails = null;
          }
        }
      });
    }
  }
}
