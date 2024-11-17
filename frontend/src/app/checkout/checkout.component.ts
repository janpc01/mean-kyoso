import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../_services/cart.service';
import { OrderService } from '../_services/order.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  sameAsShipping: boolean = true;
  isSubmitting: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {}

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
        fullName: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)],
        addressLine1: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)],
        addressLine2: [''],
        city: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)],
        province: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)],
        postalCode: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)],
        country: ['', this.conditionalValidator(() => !this.checkoutForm?.get('sameAsShipping')?.value, Validators.required)]
      }),
      payment: this.fb.group({
        cardNumber: ['', [
          Validators.required,
          Validators.pattern(/^[0-9]{16}$/)
        ]],
        cardHolder: ['', Validators.required],
        expiryDate: ['', [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        ]],
        cvv: ['', [
          Validators.required,
          Validators.pattern(/^[0-9]{3,4}$/)
        ]]
      })
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      this.cartService.getCart()
        .pipe(
          take(1),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (cartItems) => {
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
              state: shippingInfo.province,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
              phone: shippingInfo.phone
            };

            const totalAmount = this.cartService.getTotal();

            const paymentInfo = this.checkoutForm.get('payment')?.value;
            const paymentDetails = {
              cardNumber: paymentInfo.cardNumber,
              cardHolder: paymentInfo.cardHolder,
              expiryDate: paymentInfo.expiryDate,
              cvv: paymentInfo.cvv
            };

            this.orderService.createOrder(
              orderItems,
              shippingAddress,
              totalAmount,
              paymentDetails
            ).subscribe({
              next: (order) => {
                this.cartService.clearCart();
                this.router.navigate(['/order-confirmation'], { 
                  queryParams: { orderId: order._id },
                  skipLocationChange: false,
                  replaceUrl: true
                });
              },
              error: (error) => {
                console.error('Error creating order:', error);
                alert('There was an error processing your payment. Please try again.');
                this.isSubmitting = false;
              }
            });
          },
          error: (error) => {
            console.error('Error creating order:', error);
            alert('There was an error processing your payment. Please try again.');
            this.isSubmitting = false;
          }
        });
    }
  }

  onSameAsShippingChange(): void {
    const sameAsShipping = this.checkoutForm.get('sameAsShipping')?.value;
    if (sameAsShipping) {
      const shippingValue = this.checkoutForm.get('shipping')?.value;
      this.checkoutForm.get('billing')?.patchValue(shippingValue);
    }
  }

  private conditionalValidator(condition: () => boolean, validator: ValidatorFn): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (condition()) {
        return validator(control);
      }
      return null;
    };
  }
}