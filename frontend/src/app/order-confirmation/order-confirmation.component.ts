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

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      
      if (!this.orderId) {
        console.error('No orderId found in URL, redirecting to home');
        this.router.navigate(['/']);
        return;
      }

      this.loadOrderDetails();
    });
  }

  private loadOrderDetails(): void {
    console.log('Loading order details for ID:', this.orderId);
    
    this.orderService.getOrderById(this.orderId!).subscribe({
      next: (order) => {
        console.log('Order details received:', order);
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
          console.error('Order not found');
          this.router.navigate(['/']);
        }
        this.orderDetails = null;
      }
    });
  }
}
