import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../testing/mocks';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../features/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: Pick<AuthService, 'isLoggedIn$'>;
  let routerMock: Mocked<Router>;

  beforeEach(() => {
    const spyAuth = { isLoggedIn$: of(true) };

    const spyRouter = createMock('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: spyAuth },
        { provide: Router, useValue: spyRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authServiceMock = TestBed.inject(
      AuthService
    ) as Pick<AuthService, 'isLoggedIn$'>;
    routerMock = TestBed.inject(Router) as Mocked<Router>;
  });

  it('deve permitir ativação quando isLoggedIn$ emitir true', (async () => {
    authServiceMock.isLoggedIn$ = of(true);

    guard.canActivate(null as any, null as any).subscribe((result) => {
      expect(result).toBe(true);
    });
  }));

  it('deve redirecionar para /login quando isLoggedIn$ emitir false', (async () => {
    authServiceMock.isLoggedIn$ = of(false);

    const fakeTree = {} as UrlTree;
    routerMock.parseUrl.mockReturnValue(fakeTree);

    guard.canActivate(null as any, null as any).subscribe((result) => {
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/login?reason=signin-required');
      expect(result).toBe(fakeTree);
    });
  }));
});
