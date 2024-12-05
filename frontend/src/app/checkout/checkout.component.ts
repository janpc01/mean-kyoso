import { Component, OnInit, OnDestroy } from '@angular/core';
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
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  isSubmitting: boolean = false;
  showPaymentElement: boolean = false;
  private destroy$ = new Subject<void>();
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  isProcessing = false;
  showCheckoutOptions: boolean = false;
  orderCompleted = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    public router: Router,
    private paymentService: PaymentService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Check if we're returning from Stripe
    this.activatedRoute.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params: { payment_intent?: string; redirect_status?: string }) => {
      const paymentIntent = params.payment_intent;
      const redirectStatus = params.redirect_status;
      
      if (paymentIntent && redirectStatus === 'succeeded') {
        console.log('Payment successful, creating order...');
        this.handleStripeReturn(paymentIntent);
      } else {
        // Save cart items when first loading checkout
        const cartItems = this.cartService.getCartItems();
        if (cartItems.length > 0) {
          localStorage.setItem('cartItems', JSON.stringify(cartItems));
          console.log('Saved cart items:', cartItems);
        }
      }
    });

    // Initialize Stripe elements
    this.initializeStripe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up localStorage if navigating away without completing order
    if (!this.orderCompleted) {
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('cartItems');
    }
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
      })
    });
  }

  private async initializeStripe() {
    try {
      const stripe = await this.paymentService.getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      this.stripe = stripe;
      return stripe;
    } catch (error) {
      throw error;
    }
  }

  private async initializePaymentElement() {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const paymentElement = document.getElementById('payment-element');
      if (!paymentElement) {
        throw new Error('Payment element container not found');
      }

      const total = this.cartService.getTotal();
      const email = this.checkoutForm.get('shipping.email')?.value;
      const response = await firstValueFrom(this.paymentService.createPaymentIntent(total, email));
      const { clientSecret } = response;
      
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: { theme: 'stripe' }
      });

      const element = this.elements.create('payment');
      element.mount('#payment-element');
    } catch (error) {
      this.showPaymentElement = false; // Hide the payment element on error
      throw error;
    }
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.stripe || !this.elements || !this.checkoutForm.valid) {
      return;
    }

    // Store shipping info before payment
    localStorage.setItem('shippingInfo', JSON.stringify(this.checkoutForm.get('shipping')?.value));
    
    this.isProcessing = true;
    const email = this.checkoutForm.get('shipping.email')?.value;

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          receipt_email: email,
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              email: email
            }
          }
        }
      });

      if (error) {
        alert('Payment failed: ' + error.message);
        this.isProcessing = false;
      }
    } catch (e) {
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

          console.log('Creating order with:', {
            items: orderItems,
            shipping: shippingAddress,
            total: totalAmount,
            payment: paymentIntentId
          });

          this.orderService.createOrder(
            orderItems,
            shippingAddress,
            totalAmount,
            { paymentIntentId }
          ).subscribe({
            next: (order) => {
              console.log('Order created successfully:', order);
              this.cartService.clearCart();
              localStorage.removeItem('shippingInfo');
              localStorage.removeItem('cartItems');
              this.orderCompleted = true;
              this.router.navigate(['/order-confirmation'], { 
                queryParams: { orderId: order._id },
                state: { order: order }
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

  async proceedToPayment() {
    if (this.checkoutForm.get('shipping')?.valid) {
      try {
        const stripe = await this.initializeStripe();
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        this.stripe = stripe;
        
        const email = this.checkoutForm.get('shipping.email')?.value;
        if (!email) {
          throw new Error('Email is required');
        }
        
        // First show the payment element container
        this.showPaymentElement = true;
        
        // Wait for the DOM to update
        setTimeout(async () => {
          await this.initializePaymentElement();
        }, 0);
        
      } catch (error) {
        alert('Error initializing payment. Please try again.');
      }
    } else {
      alert('Please fill out all required shipping information.');
    }
  }

  private async handlePayment() {
    try {
      // Create pending order first
      const order = await firstValueFrom(this.createPendingOrder());
      
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?orderId=${order._id}`,
        },
      });
      
      if (error) {
        // Handle error, maybe delete pending order
        await this.orderService.deleteOrder(order._id).toPromise();
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  }

  private async handleStripeReturn(paymentIntentId: string) {
    // Load shipping info from localStorage
    const savedShippingInfo = localStorage.getItem('shippingInfo');
    const savedCartItems = localStorage.getItem('cartItems');
    
    if (!savedShippingInfo || !savedCartItems) {
      console.error('Missing saved data:', { 
        shippingInfo: !!savedShippingInfo, 
        cartItems: !!savedCartItems 
      });
      return;
    }

    const shippingInfo = JSON.parse(savedShippingInfo);
    const cartItems = JSON.parse(savedCartItems);
    
    // Restore cart items if needed
    if (this.cartService.getCartItems().length === 0) {
      cartItems.forEach((item: any) => this.cartService.addToCart(item));
    }

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

          console.log('Creating order with:', {
            items: orderItems,
            shipping: shippingAddress,
            total: totalAmount,
            payment: paymentIntentId
          });

          this.orderService.createOrder(
            orderItems,
            shippingAddress,
            totalAmount,
            { paymentIntentId }
          ).subscribe({
            next: (order) => {
              console.log('Order created successfully, navigating with:', order);
              this.cartService.clearCart();
              localStorage.removeItem('shippingInfo'); // Clean up
              this.router.navigate(['/order-confirmation'], { 
                queryParams: { orderId: order._id },
                state: { order }
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
}