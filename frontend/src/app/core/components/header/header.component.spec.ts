import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../features/auth/auth.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['logout'], {
      isLoggedIn$: of(true),
      isAdmin$: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, CommonModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }, provideRouter([])],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exibir botão de logout quando isLoggedIn$ emitir true', () => {
    const btnLogout = fixture.debugElement.query(By.css('button.logout'));
    expect(btnLogout).toBeTruthy();
  });

  it('logout deve chamar authService.logout()', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
