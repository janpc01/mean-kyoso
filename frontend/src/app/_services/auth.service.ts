import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';

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
    return firstValueFrom(
      this.http.post(AUTH_API + 'signin', { email, password }, httpOptions)
    );
  }

  async logout(): Promise<any> {
    return firstValueFrom(
      this.http.post(AUTH_API + 'signout', {}, httpOptions)
    );
  }

  async verify(): Promise<any> {
    return firstValueFrom(
      this.http.get(AUTH_API + 'verify', httpOptions)
    );
  }

  async register(email: string, password: string): Promise<any> {
    return firstValueFrom(
      this.http.post(AUTH_API + 'signup', { email, password }, httpOptions)
    );
  }
}
