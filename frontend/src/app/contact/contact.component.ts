import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService, ContactMessage } from '../_services/email.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async onSubmit() {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;
      
      try {
        const contactData: ContactMessage = this.contactForm.value;
        await this.emailService.sendContactEmail(contactData);
        this.submitSuccess = true;
        this.contactForm.reset();
      } catch (error: any) {
        this.submitError = error.error?.message || 'Failed to send message. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
