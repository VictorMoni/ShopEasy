import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../features/auth/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const target = new URL(req.url, window.location.origin);
    const api = new URL(environment.apiUrl);
    if (target.origin !== api.origin || !target.pathname.startsWith('/api/')) {
      return next.handle(req);
    }
    if (
      req.url.endsWith('/api/auth/register') ||
      req.url.endsWith('/api/auth/login') ||
      req.url.endsWith('/api/auth/refresh')
    ) {
      return next.handle(req);
    }

    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return from(this.authService.refreshToken()).pipe(
            switchMap((newToken) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(retryReq);
            }),
            catchError((refreshErr) => {
              this.authService.logout();
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
