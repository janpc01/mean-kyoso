import { Component } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: any = {
    email: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  isLoading = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService, 
    private storageService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;
    
    const { email, password } = this.form;
    this.isLoading = true;
    this.isLoginFailed = false;
    this.errorMessage = '';

    try {
      const loginData = await this.authService.login(email, password);
      await this.handleLoginSuccess(loginData);
    } catch (err: any) {
      this.handleLoginError(err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async handleLoginSuccess(data: any): Promise<void> {
    this.storageService.saveUser(data);
    this.isLoginFailed = false;
    this.isLoggedIn = true;
    this.roles = this.storageService.getUser().roles;
    
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin');
      await this.router.navigate([redirectUrl]);
    } else {
      await this.router.navigate(['/home']);
    }
  }

  private handleLoginError(err: any): void {
    this.errorMessage = err.error?.message || 'An error occurred during login';
    this.isLoginFailed = true;
    this.isLoggedIn = false;
  }
}
