import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private publicRoutes = [
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/cards/search',
    '/api/cards/all',
    '/api/test/all'
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't add credentials for public routes
    if (this.publicRoutes.some(route => req.url.includes(route))) {
      return next.handle(req);
    }

    // Add credentials for authenticated routes
    const clonedRequest = req.clone({
      withCredentials: true
    });
    return next.handle(clonedRequest);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];