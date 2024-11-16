import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true, // Add this to allow credentials like cookies
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  // Login API Call
  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      { username, password },
      {
        headers: httpOptions.headers,
        withCredentials: true, // Add this for credentials
      }
    );
  }

  // Registration API Call
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      { username, email, password },
      {
        headers: httpOptions.headers,
        withCredentials: true, // Add this for credentials
      }
    );
  }

  // Logout API Call
  logout(): Observable<any> {
    return this.http.post(
      AUTH_API + 'signout',
      {},
      {
        headers: httpOptions.headers,
        withCredentials: true, // Add this for credentials
      }
    );
  }
}
