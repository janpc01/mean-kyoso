import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../_services/order.service';
import { CartService } from '../_services/cart.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  orderDetails: any = null;
  private subscription: any;
  private loaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (!this.loaded) {
      this.subscription = this.route.queryParams.subscribe(async params => {
        const paymentIntentId = params['payment_intent'];
        const orderId = params['orderId'];

        if (orderId && !this.loaded) {
          this.orderId = orderId;
          this.loadOrderDetails();
          this.loaded = true;
        } else if (paymentIntentId && !this.loaded) {
          try {
            const order = await firstValueFrom(this.orderService.createOrder(
              this.cartService.getCartItems(),
              JSON.parse(localStorage.getItem('shippingInfo') || '{}'),
              this.cartService.getTotal(),
              { paymentIntentId }
            ));
            
            if (order) {
              this.orderId = order._id || null;
              this.loadOrderDetails();
              this.loaded = true;
              this.cartService.clearCart();
            }
          } catch (error) {
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadOrderDetails(): void {
    console.log('Starting loadOrderDetails with orderId:', this.orderId);
    
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
    } else {
      console.error('No orderId provided to loadOrderDetails');
    }
  }
}