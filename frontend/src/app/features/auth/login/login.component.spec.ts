import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let auth: jasmine.SpyObj<AuthService>;
  const route = { snapshot: { queryParamMap: convertToParamMap({}) } };
  beforeEach(async () => {
    route.snapshot.queryParamMap = convertToParamMap({});
    auth = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth },
        { provide: ActivatedRoute, useValue: route }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });
  it('explains why an anonymous visitor was redirected', () => {
    route.snapshot.queryParamMap = convertToParamMap({reason: 'signin-required'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent)
      .toContain('Para explorar os produtos');
    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
  });
  it('does not show the contextual note for an ordinary login', () => {
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
  it('keeps invalid forms from submitting', () => {
    fixture.componentInstance.onSubmit();
    expect(auth.login).not.toHaveBeenCalled();
  });
  it('opens products after a successful login', () => {
    auth.login.and.returnValue(of({accessToken: 'test-access', refreshToken: 'test-refresh'}));
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentInstance.loginForm.setValue({username:'customer',password:'test-password'});
    fixture.componentInstance.onSubmit();
    expect(navigate).toHaveBeenCalledWith(['/products']);
  });
});
