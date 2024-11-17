import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../_services/order.service';

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
    private orderService: OrderService
  ) {}

  ngOnInit() {
    if (!this.loaded) {
      this.subscription = this.route.queryParams.subscribe(params => {
        const newOrderId = params['orderId'];
        if (newOrderId && !this.loaded) {
          this.orderId = newOrderId;
          this.loadOrderDetails();
          this.loaded = true;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadOrderDetails() {
    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          console.log('Order details loaded:', order);
          this.orderDetails = order;
        },
        error: (error) => {
          console.error('Error loading order details:', error);
        }
      });
    }
  }
}