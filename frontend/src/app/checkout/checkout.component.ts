import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { OrderService } from '../_services/order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  sameAsShipping: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {}

  private initForm() {
    this.checkoutForm = this.fb.group({
      shipping: this.fb.group({
        fullName: ['', Validators.required],
        phone: ['', Validators.required],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: [''],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      sameAsShipping: [true],
      billing: this.fb.group({
        fullName: [''],
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        country: ['']
      })
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.cartService.getCart().subscribe(cartItems => {
        const shippingInfo = this.checkoutForm.get('shipping')?.value;
        
        const orderItems = cartItems.map(item => ({
          cardId: item.cardId,
          quantity: item.quantity
        }));

        const shippingAddress = {
          fullName: shippingInfo.fullName,
          addressLine1: shippingInfo.addressLine1,
          addressLine2: shippingInfo.addressLine2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone
        };

        const totalAmount = this.cartService.getTotal();

        this.orderService.createOrder(orderItems, shippingAddress, totalAmount)
          .subscribe({
            next: (order) => {
              this.cartService.clearCart();
              this.router.navigate(['/order-confirmation'], { 
                queryParams: { orderId: order._id }
              });
            },
            error: (error) => {
              console.error('Error creating order:', error);
              // Handle error (show message to user)
              this.isSubmitting = false;
            }
          });
      });
    }
  }

  onSameAsShippingChange() {
    const sameAsShipping = this.checkoutForm.get('sameAsShipping')?.value;
    if (sameAsShipping) {
      const shipping = this.checkoutForm.get('shipping')?.value;
      this.checkoutForm.get('billing')?.patchValue(shipping);
    }
  }
}