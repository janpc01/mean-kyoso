import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.css']
})
export class SignupModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() signupSuccess = new EventEmitter<void>();

  form = {
    username: '',
    email: '',
    password: ''
  };
  isSignUpFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  onSubmit(): void {
    const { username, email, password } = this.form;

    this.authService.register(username, email, password).subscribe({
      next: () => {
        this.authService.login(username, password).subscribe({
          next: loginData => {
            this.storageService.saveUser(loginData);
            this.signupSuccess.emit();
            localStorage.setItem('redirectAfterLogin', '/user/cards');
            window.location.reload();
          },
          error: err => {
            this.errorMessage = err.error.message;
            this.isSignUpFailed = true;
          }
        });
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}