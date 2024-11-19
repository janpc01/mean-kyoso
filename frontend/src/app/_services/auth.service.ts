import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Use tap to handle side effects like saving token
import { StorageService } from './storage.service';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  // Login API Call
  login(username: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signin', { username, password }, httpOptions).pipe(
      tap((response: any) => {
        // Save token to localStorage upon successful login
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  // Registration API Call
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(AUTH_API + 'signup', { username, email, password }, httpOptions);
  }

  // Logout API Call
  logout(): Observable<any> {
    // Clear the token first
    localStorage.removeItem('token');
    // Return the API call with error handling
    return this.http.post(AUTH_API + 'signout', {}, httpOptions).pipe(
      tap(() => {
        // Clear storage immediately after successful logout
        this.storageService.clean();
      })
    );
  }

  // Retrieve the stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
