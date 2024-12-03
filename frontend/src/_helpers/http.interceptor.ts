import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private publicRoutes = [
    '/api/cards/search',
    '/api/cards/all',
    '/api/test/all'
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Intercepting request:', req.url);
    console.log('Current publicRoutes:', this.publicRoutes);
    
    if (this.publicRoutes.some(route => req.url.includes(route))) {
      console.log('Skipping credentials for public route');
      return next.handle(req);
    }

    console.log('Adding credentials to request');
    const clonedRequest = req.clone({
      withCredentials: true
    });
    return next.handle(clonedRequest);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];