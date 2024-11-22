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
    const userData = {
      id: user.id,
      email: user.email,
      roles: user.roles
    };
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
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