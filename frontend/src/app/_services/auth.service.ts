import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const AUTH_API = 'https://kyoso-backend-dhheg8akajdre6ce.canadacentral-01.azurewebsites.net/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<any> {
    console.log('Attempting login...');
    const response = await firstValueFrom(
      this.http.post(AUTH_API + 'signin', { email, password }, httpOptions)
    );
    console.log('Login response:', response);
    console.log('Cookies after login:', document.cookie);
    return response;
  }

  async logout(): Promise<any> {
    return firstValueFrom(
      this.http.post(AUTH_API + 'signout', {}, httpOptions)
    );
  }

  async verify(): Promise<any> {
    try {
      return firstValueFrom(
        this.http.get(AUTH_API + 'verify', httpOptions)
      );
    } catch (error) {
      console.error('Verify request failed:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<any> {
    return firstValueFrom(
      this.http.post(AUTH_API + 'signup', { email, password }, httpOptions)
    );
  }
}
