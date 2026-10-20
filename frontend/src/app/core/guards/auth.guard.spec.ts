import { TestBed, waitForAsync } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../features/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: Pick<AuthService, 'isLoggedIn$'>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spyAuth = { isLoggedIn$: of(true) };

    const spyRouter = jasmine.createSpyObj('Router', ['parseUrl']);

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
    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('deve permitir ativação quando isLoggedIn$ emitir true', waitForAsync(() => {
    authServiceMock.isLoggedIn$ = of(true);

    guard.canActivate(null as any, null as any).subscribe((result) => {
      expect(result).toBeTrue();
    });
  }));

  it('deve redirecionar para /login quando isLoggedIn$ emitir false', waitForAsync(() => {
    authServiceMock.isLoggedIn$ = of(false);

    const fakeTree = {} as UrlTree;
    routerMock.parseUrl.and.returnValue(fakeTree);

    guard.canActivate(null as any, null as any).subscribe((result) => {
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/login?reason=signin-required');
      expect(result).toBe(fakeTree);
    });
  }));
});
