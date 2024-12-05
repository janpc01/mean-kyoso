import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { OrderService } from '../_services/order.service';
import { PaymentService } from '../_services/payment.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  isProcessing = false;
  elements: StripeElements | null = null;
  stripe: Stripe | null = null;
  showPaymentElement = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['payment_intent'] && params['redirect_status'] === 'succeeded') {
        this.handlePaymentSuccess(params['payment_intent']);
      }
    });
    this.initializeStripe();
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.stripe || !this.elements) {
      console.error('Stripe not initialized');
      return;
    }

    this.isProcessing = true;
    const email = this.checkoutForm.get('shipping.email')?.value;
    const amount = this.cartService.getTotal();

    try {
      const { clientSecret } = await firstValueFrom(
        this.paymentService.createPaymentIntent(amount, email)
      );

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          receipt_email: email,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        alert(error.message);
      }
    } catch (e) {
      console.error('Payment error:', e);
      alert('An error occurred during payment. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  async proceedToPayment() {
    if (!this.checkoutForm.get('shipping')?.valid) {
      return;
    }
    this.showPaymentElement = true;
    await this.initializeStripe();
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      shipping: this.fb.group({
        fullName: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: [''],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      })
    });
  }

  private async initializeStripe() {
    this.stripe = await this.paymentService.getStripe();
    if (!this.stripe) {
      console.error('Failed to initialize Stripe');
      return;
    }
  }

  private handlePaymentSuccess(paymentIntentId: string) {
    const orderData = {
      items: this.cartService.getCartItems(),
      shipping: this.checkoutForm.get('shipping')?.value,
      payment: { paymentIntentId }
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], { 
          queryParams: { orderId: order._id }
        });
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('There was an error processing your order.');
      }
    });
  }
}