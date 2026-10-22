import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Observable,
  BehaviorSubject,
  of,
  throwError,
  switchMap,
  firstValueFrom,
} from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt'; // npm install @auth0/angular-jwt

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  // Guardamos o role (string) para não precisar chamar /users/me toda hora
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    try {
      if (!token || this.jwtHelper.isTokenExpired(token)) {
        this.clearAuthData();
        return;
      }
      const decoded = this.jwtHelper.decodeToken(token);
      // Older sessions predate typed tokens and must authenticate again.
      if (decoded?.token_use !== 'access') {
        this.clearAuthData();
        return;
      }
      this.isAdminSubject.next(this.hasAdminRole(decoded));
      this.loggedInSubject.next(true);
    } catch {
      this.clearAuthData();
    }
  }

  private hasAdminRole(decoded: { role?: string; roles?: unknown } | null): boolean {
    if (decoded?.role) return decoded.role === 'ADMIN';
    return Array.isArray(decoded?.roles)
      && decoded.roles.some(role => role === 'ADMIN' || role === 'ROLE_ADMIN');
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.loggedInSubject.next(false);
    this.isAdminSubject.next(false);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          this.loggedInSubject.next(true);

          const decoded = this.jwtHelper.decodeToken(res.accessToken);
          this.isAdminSubject.next(this.hasAdminRole(decoded));
        }),
        catchError((err) => {
          return throwError(() => new Error('Erro no login'));
        })
      );
  }

  register(username: string, password: string, role: string): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/api/auth/register`, {
        username,
        password,
        role,
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 409) {
            return throwError(() => new Error('Usuário já existe'));
          }
          return throwError(() => new Error('Erro ao registrar usuário'));
        }),
        switchMap(() => of(void 0))
      );
  }

  logout(): void {
    this.clearAuthData();
    this.loggedInSubject.next(false);
    this.isAdminSubject.next(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthData();
      return Promise.reject('Sem refresh token');
    }

    try {
      // Usamos firstValueFrom para converter o Observable em Promise<string>
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/refresh`, {
          refreshToken,
        })
      );

      // Se chegamos aqui, recebemos novos tokens
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      this.loggedInSubject.next(true);

      const decoded = this.jwtHelper.decodeToken(res.accessToken);
      this.isAdminSubject.next(this.hasAdminRole(decoded));

      return res.accessToken;
    } catch (err) {
      // Se ocorrer erro (status 401 ou outro), limpamos tudo e rejeitamos
      this.clearAuthData();
      return Promise.reject('Não foi possível renovar token');
    }
  }
}
