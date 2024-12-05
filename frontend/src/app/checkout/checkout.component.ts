import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { OrderService } from '../_services/order.service';
import { PaymentService } from '../_services/payment.service';
import { Stripe, StripeElements } from '@stripe/stripe-js';

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
    // Handle redirect from Stripe
    this.route.queryParams.subscribe(params => {
      if (params['payment_intent'] && params['redirect_status'] === 'succeeded') {
        this.handlePaymentSuccess(params['payment_intent']);
      }
    });
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      shipping: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        addressLine1: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      })
    });
  }

  async proceedToPayment() {
    if (!this.checkoutForm.get('shipping')?.valid) return;
    
    this.stripe = await this.paymentService.getStripe();
    if (!this.stripe) {
      console.error('Failed to load Stripe');
      return;
    }

    this.showPaymentElement = true;
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.stripe) return;

    this.isProcessing = true;
    const amount = this.cartService.getTotal();
    const email = this.checkoutForm.get('shipping.email')?.value;

    try {
      const { clientSecret } = await this.paymentService.createPaymentIntent(amount, email).toPromise();
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          receipt_email: email,
        }
      });

      if (error) {
        console.error('Payment error:', error);
        alert(error.message);
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Payment failed. Please try again.');
    } finally {
      this.isProcessing = false;
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