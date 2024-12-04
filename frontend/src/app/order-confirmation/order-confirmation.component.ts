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
      this.orderId = params['orderId'] || null;
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        console.error('No orderId found in URL');
      }
    });
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
          console.error('Error loading order details:', error);
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
          this.orderDetails = null;
        }
      });
    }
  }
}
