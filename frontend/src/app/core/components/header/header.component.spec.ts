import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
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
  let authServiceSpy: Mocked<AuthService>;

  beforeEach(async () => {
    const spy = createMock('AuthService', ['logout'], {
      isLoggedIn$: of(true),
      isAdmin$: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, CommonModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }, provideRouter([])],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exibir botão de logout quando isLoggedIn$ emitir true', () => {
    const btnLogout = fixture.debugElement.query(By.css('button.logout'));
    expect(btnLogout).toBeTruthy();
  });

  it('alterna o tema e mantém a preferência salva', () => {
    const previous = localStorage.getItem('shopeasy-theme');
    const previousTheme = document.documentElement.dataset['theme'];
    const previousScheme = document.documentElement.style.colorScheme;
    try {
      component.darkMode = false;
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button.theme-toggle').click();
      fixture.detectChanges();
      expect(document.documentElement.dataset['theme']).toBe('dark');
      expect(localStorage.getItem('shopeasy-theme')).toBe('dark');
      expect(fixture.nativeElement.querySelector('button.theme-toggle').getAttribute('aria-label')).toBe('Ativar modo claro');
      component.toggleTheme();
      expect(document.documentElement.dataset['theme']).toBe('light');
    } finally {
      if (previous === null) localStorage.removeItem('shopeasy-theme');
      else localStorage.setItem('shopeasy-theme', previous);
      if (previousTheme === undefined) delete document.documentElement.dataset['theme'];
      else document.documentElement.dataset['theme'] = previousTheme;
      document.documentElement.style.colorScheme = previousScheme;
    }
  });

  it('logout deve chamar authService.logout()', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});