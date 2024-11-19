import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { OrderService } from '../_services/order.service';
import { PaymentService } from '../_services/payment.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  isSubmitting: boolean = false;
  private destroy$ = new Subject<void>();
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  paymentElementVisible = false;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private paymentService: PaymentService
  ) {
    this.initForm();
    this.initFormListeners();
  }

  ngOnInit() {
    this.initializeStripe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
        province: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      sameAsShipping: [true],
      billing: this.fb.group({
        fullName: [''],
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        province: [''],
        postalCode: [''],
        country: ['']
      })
    });
  }

  private async initializeStripe() {
    this.stripe = await this.paymentService.getStripe();
  }

  private async initializePaymentElement(clientSecret: string) {
    if (this.stripe) {
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe'
        }
      });

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');
      this.paymentElementVisible = true;
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.stripe || !this.elements || !this.checkoutForm.valid) {
      return;
    }

    this.isProcessing = true;
    const email = this.checkoutForm.get('shipping.email')?.value;

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          receipt_email: email,
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error('Payment error:', error);
        alert('Payment failed: ' + error.message);
        this.isProcessing = false;
      } else if (paymentIntent.status === 'succeeded') {
        await this.createOrder(paymentIntent.id);
      }
    } catch (e) {
      console.error('Error:', e);
      this.isProcessing = false;
    }
  }

  private async createOrder(paymentIntentId: string) {
    const shippingInfo = this.checkoutForm.get('shipping')?.value;
    
    this.cartService.getCart()
      .pipe(
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (cartItems) => {
          const orderItems = cartItems.map(item => ({
            cardId: item.cardId,
            quantity: item.quantity
          }));

          const shippingAddress = {
            fullName: shippingInfo.fullName,
            addressLine1: shippingInfo.addressLine1,
            addressLine2: shippingInfo.addressLine2,
            city: shippingInfo.city,
            state: shippingInfo.province,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone
          };

          const totalAmount = this.cartService.getTotal();

          this.orderService.createOrder(
            orderItems,
            shippingAddress,
            totalAmount,
            { paymentIntentId }
          ).subscribe({
            next: (order) => {
              this.cartService.clearCart();
              this.router.navigate(['/order-confirmation'], { 
                queryParams: { orderId: order._id }
              });
            },
            error: (error) => {
              console.error('Error creating order:', error);
              alert('There was an error processing your order. Please try again.');
              this.isProcessing = false;
            }
          });
        }
      });
  }

  private initFormListeners() {
    this.checkoutForm.get('shipping.email')?.valueChanges.subscribe(async (email) => {
      if (email && this.checkoutForm.get('shipping.email')?.valid && !this.paymentElementVisible) {
        const total = this.cartService.getTotal();
        try {
          const response = await this.paymentService.createPaymentIntent(total, email).toPromise();
          if (response && this.stripe) {
            await this.initializePaymentElement(response.clientSecret);
          }
        } catch (error) {
          console.error('Error initializing payment:', error);
        }
      }
    });
  }
}