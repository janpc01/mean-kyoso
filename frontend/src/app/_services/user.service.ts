import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:8080/api/test/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  async getPublicContent(): Promise<any> {
    return firstValueFrom(
      this.http.get(API_URL + 'all', { responseType: 'text' })
    );
  }

  async getUserBoard(): Promise<any> {
    return firstValueFrom(
      this.http.get(API_URL + 'user', { responseType: 'text' })
    );
  }

  async getModeratorBoard(): Promise<any> {
    return firstValueFrom(
      this.http.get(API_URL + 'mod', { responseType: 'text' })
    );
  }

  async getAdminBoard(): Promise<any> {
    return firstValueFrom(
      this.http.get(API_URL + 'admin', { responseType: 'text' })
    );
  }
}
