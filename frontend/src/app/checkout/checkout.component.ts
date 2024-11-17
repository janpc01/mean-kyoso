import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  sameAsShipping: boolean = true;

  constructor(private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      shipping: this.fb.group({
        fullName: ['', Validators.required],
        phoneNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        street: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      sameAsShipping: [true],
      billing: this.fb.group({
        fullName: [''],
        street: [''],
        city: [''],
        province: [''],
        postalCode: [''],
        country: ['']
      })
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      console.log(this.checkoutForm.value);
      // Handle form submission
    }
  }

  onSameAsShippingChange() {
    const billingGroup = this.checkoutForm.get('billing');
    if (this.checkoutForm.get('sameAsShipping')?.value) {
      billingGroup?.disable();
    } else {
      billingGroup?.enable();
    }
  }
}