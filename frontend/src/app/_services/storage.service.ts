import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    // Ensure we're storing the user ID along with other user data
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      token: user.token
    };
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null; // Changed from empty object to null for better null checking
  }

  public isLoggedIn(): boolean {
    const user = window.sessionStorage.getItem(USER_KEY);
    return user !== null;
  }

  public getUserId(): string | null {
    const user = this.getUser();
    return user ? user.id : null;
  }
}