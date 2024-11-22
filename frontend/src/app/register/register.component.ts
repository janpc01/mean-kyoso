import { Component } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: any = {
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private storageService: StorageService,
    private router: Router
  ) { }

  async onSubmit(): Promise<void> {
    const { email, password } = this.form;

    try {
      await this.authService.register(email, password);
      // After successful registration, automatically log in
      const loginData = await this.authService.login(email, password);
      this.storageService.saveUser(loginData);
      this.isSuccessful = true;
      this.isSignUpFailed = false;
      
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/home';
      localStorage.removeItem('redirectAfterLogin');
      
      await this.router.navigate([redirectUrl]);
    } catch (err: any) {
      this.errorMessage = err.error.message;
      this.isSignUpFailed = true;
    }
  }
}
