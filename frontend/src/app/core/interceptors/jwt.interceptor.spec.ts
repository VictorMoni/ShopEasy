import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../../features/auth/auth.service';

class MockAuthService {
  private token: string | null = null;

  setToken(tok: string | null) {
    this.token = tok;
  }

  getToken(): string | null {
    return this.token;
  }
}

describe('JwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockAuthService: MockAuthService;

  beforeEach(() => {
    mockAuthService = new MockAuthService();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    mockAuthService.setToken(null);
    localStorage.clear();
  });

  it('should create the interceptor', () => {
    const interceptor = new JwtInterceptor(mockAuthService as unknown as AuthService);
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token is present', () => {
    const fakeToken = 'fake-jwt-token';
    mockAuthService.setToken(fakeToken);

    httpClient.get('http://localhost:8080/api/products').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne((request) => {
      return request.url === 'http://localhost:8080/api/products';
    });

    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${fakeToken}`
    );

    req.flush({ data: 'ok' });
  });

  it('does not disclose bearer tokens to an unrelated origin', () => {
    mockAuthService.setToken('private-token');
    httpClient.get('https://untrusted.example/api/products').subscribe();
    const request = httpTestingController.expectOne('https://untrusted.example/api/products');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should NOT add Authorization header when token is absent' , () => {
    mockAuthService.setToken(null);
    localStorage.removeItem('accessToken');

    httpClient.get('/test-url-no-token').subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne((request) => {
      return request.url === '/test-url-no-token';
    });

    expect(req.request.headers.has('Authorization')).toBe(false);

    req.flush({ data: 'ok' });
  });
});
