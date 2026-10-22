import { vi, type Mocked } from 'vitest';
import { createMock } from '../testing/mocks';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-header',
  template: '',
  standalone: true,
})
class HeaderStubComponent {
  @Input() isAdmin!: boolean;
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let authServiceSpy: Mocked<AuthService>;

  beforeEach((async () => {
    const spy = createMock('AuthService', [], {
      isLoggedIn$: of(false),
      isAdmin$: of(false),
    });

    TestBed.configureTestingModule({
      imports: [CommonModule, AppComponent, HeaderStubComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: spy }],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  }));

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit: quando isLoggedIn$ emitir true, deve chamar isAdmin$ e emitir seu valor', () => {
    authServiceSpy.isLoggedIn$ = of(true);
    authServiceSpy.isAdmin$ = of(true);

    component.ngOnInit();
    component.isAdmin$.subscribe((value) => {
      expect(authServiceSpy.isLoggedIn$).toBeDefined();
      expect(authServiceSpy.isAdmin$).toBeDefined();
      expect(value).toBe(true);
    });
  });

  it('emits non-admin for an anonymous visitor even when the role stream is stale', () => {
    authServiceSpy.isLoggedIn$ = of(false);
    authServiceSpy.isAdmin$ = of(true);
    component.ngOnInit();
    const values: boolean[] = [];
    component.isAdmin$.subscribe(value => values.push(value));
    expect(values).toEqual([false]);
  });
});
