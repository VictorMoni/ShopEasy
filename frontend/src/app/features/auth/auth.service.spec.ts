import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../testing/mocks';
import { TestBed, tick } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: Mocked<HttpClient>;
  let jwtSpy: Mocked<JwtHelperService>;

  const dummyAuthResponse = {
    accessToken: 'valid.token.here',
    refreshToken: 'refresh.token.here',
  };

  const dummyDecodedToken = {
    role: 'ADMIN',
    roles: ['ROLE_ADMIN', 'ROLE_USER'],
  };

  beforeEach(() => {
    localStorage.clear();

    httpSpy = createMock('HttpClient', ['post']);
    jwtSpy = createMock('JwtHelperService', [
      'isTokenExpired',
      'decodeToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: JwtHelperService, useValue: jwtSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve limpar o estado se não houver token ou se token estiver expirado', (async () => {
    jwtSpy.isTokenExpired = vi.fn().mockReturnValue(true);

    service = new AuthService(httpSpy, jwtSpy);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(service.getToken()).toBeNull();

    let loggedIn = true;
    service.isLoggedIn$.subscribe((v) => (loggedIn = v));
    expect(loggedIn!).toBe(false);

    let isAdmin = true;
    service.isAdmin$.subscribe((v) => (isAdmin = v));
    expect(isAdmin!).toBe(false);
  }));

  it('deve carregar usuário do token válido no construtor', (async () => {
    localStorage.setItem('accessToken', 'valid.token.here');
    jwtSpy.isTokenExpired = vi.fn().mockReturnValue(false);
    jwtSpy.decodeToken.mockReturnValue({ role: 'ADMIN', token_use: 'access' });

    service = new AuthService(httpSpy, jwtSpy);
    await new Promise(resolve => setTimeout(resolve, 0));

    let loggedInValue = false;
    service.isLoggedIn$.subscribe((v) => (loggedInValue = v));
    expect(loggedInValue!).toBe(true);

    let isAdminValue = false;
    service.isAdmin$.subscribe((v) => (isAdminValue = v));
    expect(isAdminValue!).toBe(true);
  }));

  it.each([
    { role: 'ADMIN' },
    { role: 'ADMIN', token_use: 'refresh' },
    null,
  ])('clears a legacy or wrong-purpose stored token: %j', decoded => {
    localStorage.setItem('accessToken', 'old-token');
    localStorage.setItem('refreshToken', 'old-refresh');
    jwtSpy.isTokenExpired = vi.fn().mockReturnValue(false);
    jwtSpy.decodeToken.mockReturnValue(decoded);
    const restored = new AuthService(httpSpy, jwtSpy);
    let loggedIn = true;
    restored.isLoggedIn$.subscribe(value => loggedIn = value);
    expect(loggedIn).toBe(false);
    expect(restored.getToken()).toBeNull();
    expect(restored.getRefreshToken()).toBeNull();
  });

  it('clears malformed stored tokens without breaking application startup', () => {
    localStorage.setItem('accessToken', 'malformed');
    jwtSpy.isTokenExpired.mockImplementation(() => { throw new Error('Invalid JWT'); });
    expect(() => new AuthService(httpSpy, jwtSpy)).not.toThrow();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('preserves an admin role array after refresh', async () => {
    localStorage.setItem('refreshToken', 'old-refresh');
    httpSpy.post.mockReturnValue(of(dummyAuthResponse));
    jwtSpy.decodeToken.mockReturnValue({ roles: ['ROLE_ADMIN'], token_use: 'access' });
    await service.refreshToken();
    let isAdmin = false;
    service.isAdmin$.subscribe(value => isAdmin = value);
    expect(isAdmin).toBe(true);
  });

  describe('login()', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('deve armazenar tokens e atualizar subjects em caso de sucesso', (async () => {
      httpSpy.post.mockReturnValue(of(dummyAuthResponse));
      jwtSpy.decodeToken.mockReturnValue(dummyDecodedToken);

      service.login('user', 'pass').subscribe({
        next: (res) => {
          expect(res).toEqual(dummyAuthResponse);
        },
        error: () => {
          throw new Error('Não esperava erro');
        },
      });
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(localStorage.getItem('accessToken')).toBe(
        dummyAuthResponse.accessToken
      );
      expect(localStorage.getItem('refreshToken')).toBe(
        dummyAuthResponse.refreshToken
      );

      let loggedIn = false;
      service.isLoggedIn$.subscribe((v) => (loggedIn = v));
      expect(loggedIn!).toBe(true);

      let isAdmin = false;
      service.isAdmin$.subscribe((v) => (isAdmin = v));
      expect(isAdmin!).toBe(true);
    }));

    it('deve emitir erro "Erro no login" em caso de falha HTTP', (async () => {
      httpSpy.post.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 }))
      );

      service.login('user', 'wrong').subscribe({
        next: () => {
          throw new Error('Não esperava sucesso');
        },
        error: (err) => {
          expect(err.message).toBe('Erro no login');
        },
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    }));
  });

  describe('register()', () => {
    it('deve completar sem emitir valor em caso de sucesso', (async () => {
      httpSpy.post.mockReturnValue(of({}));
      service.register('joao', 'senha', 'USER').subscribe({
        next: (res) => {
          expect(res).toBeUndefined();
        },
        complete: () => {},
        error: () => {
          throw new Error('Não esperava erro');
        },
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    }));

    it('deve emitir erro "Usuário já existe" quando status 409', (async () => {
      const httpError = new HttpErrorResponse({ status: 409 });
      httpSpy.post.mockReturnValue(throwError(() => httpError));
      service.register('joao', 'senha', 'USER').subscribe({
        next: () => {
          throw new Error('Não esperava sucesso');
        },
        error: (err) => {
          expect(err.message).toBe('Usuário já existe');
        },
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    }));

    it('deve emitir erro genérico em outro status', (async () => {
      const httpError = new HttpErrorResponse({ status: 500 });
      httpSpy.post.mockReturnValue(throwError(() => httpError));
      service.register('joao', 'senha', 'USER').subscribe({
        next: () => {
          throw new Error('Não esperava sucesso');
        },
        error: (err) => {
          expect(err.message).toBe('Erro ao registrar usuário');
        },
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    }));
  });

  describe('logout()', () => {
    it('deve limpar localStorage e atualizar subjects', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('refreshToken', 'refresh');
      (service as any).loggedInSubject.next(true);
      (service as any).isAdminSubject.next(true);

      service.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();

      let loggedIn = true;
      service.isLoggedIn$.subscribe((v) => (loggedIn = v));
      expect(loggedIn!).toBe(false);

      let isAdmin = true;
      service.isAdmin$.subscribe((v) => (isAdmin = v));
      expect(isAdmin!).toBe(false);
    });
  });

  describe('getToken() / getRefreshToken()', () => {
    it('deve retornar null quando não há tokens', () => {
      localStorage.clear();
      expect(service.getToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });

    it('deve retornar valores corretos quando existem no localStorage', () => {
      localStorage.setItem('accessToken', 'abc');
      localStorage.setItem('refreshToken', 'xyz');
      expect(service.getToken()).toBe('abc');
      expect(service.getRefreshToken()).toBe('xyz');
    });
  });

  describe('refreshToken()', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('deve rejeitar se não houver refreshToken', (async () => {
      let caughtError: any;
      service
        .refreshToken()
        .then(() => {
          throw new Error('Não esperava sucesso');
        })
        .catch((err) => {
          caughtError = err;
        });
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(caughtError).toBe('Sem refresh token');
    }));

    it('deve renovar tokens em caso de sucesso HTTP', (async () => {
      localStorage.setItem('refreshToken', 'oldRefresh');
      const newAuth: any = {
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
      };
      httpSpy.post.mockReturnValue(of(newAuth));
      jwtSpy.decodeToken.mockReturnValue({ role: 'ADMIN', token_use: 'access' });

      let resultToken: string | undefined;
      service
        .refreshToken()
        .then((token) => {
          resultToken = token;
        })
        .catch(() => {
          throw new Error('Não esperava erro');
        });
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(localStorage.getItem('accessToken')).toBe('newAccess');
      expect(localStorage.getItem('refreshToken')).toBe('newRefresh');

      let loggedIn = false;
      service.isLoggedIn$.subscribe((v) => (loggedIn = v));
      expect(loggedIn!).toBe(true);

      let isAdmin = false;
      service.isAdmin$.subscribe((v) => (isAdmin = v));
      expect(isAdmin!).toBe(true);

      expect(resultToken).toBe('newAccess');
    }));

    it('deve rejeitar e limpar dados se HTTP falhar', (async () => {
      localStorage.setItem('refreshToken', 'oldRefresh');
      httpSpy.post.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 }))
      );
      vi.spyOn(service as any, 'clearAuthData');

      let caughtError: any;
      service
        .refreshToken()
        .then(() => {
          throw new Error('Não esperava sucesso');
        })
        .catch((err) => {
          caughtError = err;
        });
      await new Promise(resolve => setTimeout(resolve, 0));
      expect((service as any).clearAuthData).toHaveBeenCalled();
      expect(caughtError).toBe('Não foi possível renovar token');

      let loggedIn = true;
      service.isLoggedIn$.subscribe((v) => (loggedIn = v));
      expect(loggedIn!).toBe(false);

      let isAdmin = true;
      service.isAdmin$.subscribe((v) => (isAdmin = v));
      expect(isAdmin!).toBe(false);
    }));
  });
});
