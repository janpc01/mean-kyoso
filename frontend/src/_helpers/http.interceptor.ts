import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private publicRoutes = [
    '/api/cards/search',
    '/api/cards/all',
    '/api/test/all',
    '/api/orders',
    '/api/payment'  // Add payment routes as public too
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Intercepting request:', req.url);
    
    // Check if it's a public route
    const isPublicRoute = this.publicRoutes.some(route => 
      req.url.toLowerCase().includes(route.toLowerCase())
    );
    
    if (isPublicRoute) {
      console.log('Public route detected:', req.url);
      // For public routes, don't add any credentials
      return next.handle(req);
    }

    console.log('Private route detected:', req.url);
    const clonedRequest = req.clone({
      withCredentials: true
    });
    return next.handle(clonedRequest);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];