import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../_services/order.service';
import { CartService } from '../_services/cart.service';

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
            const order = await this.orderService.createOrder(
              this.cartService.getCartItems(),
              JSON.parse(localStorage.getItem('shippingInfo') || '{}'),
              this.cartService.getTotal(),
              { paymentIntentId }
            ).toPromise();
            
            if (order) {
              this.orderId = order._id || null;
              this.loadOrderDetails();
              this.loaded = true;
              this.cartService.clearCart();
            }
          } catch (error) {
            console.error('Error creating order:', error);
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
    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.orderDetails = order;
        },
        error: (error) => {
          console.error('Error loading order details:', error);
        }
      });
    }
  }
}