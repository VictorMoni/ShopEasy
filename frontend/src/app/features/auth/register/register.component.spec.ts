import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: Mocked<AuthService>;
  let routerSpy: Mocked<Router>;

  beforeEach(async () => {
    const authSpy = createMock('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        provideRouter([]),

      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;
    routerSpy = TestBed.inject(Router) as Mocked<Router>;
    vi.spyOn(routerSpy, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('form deve ser inválido inicialmente', () => {
    expect(component.registerForm.valid).toBe(false);
    const controls = component.registerForm.controls;
    expect(controls['username'].value).toBe('');
    expect(controls['password'].value).toBe('');
    expect(controls['role'].value).toBe('USER');
  });

  it('onSubmit não deve chamar AuthService.register se o form for inválido', () => {
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('onSubmit deve chamar AuthService.register e exibir mensagem de sucesso', (async () => {
    component.registerForm.setValue({
      username: 'joao',
      password: 'senha123',
      role: 'USER',
    });
    authServiceSpy.register.mockReturnValue(of(void 0));

    component.onSubmit();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(authServiceSpy.register).toHaveBeenCalledWith(
      'joao',
      'senha123',
      'USER'
    );
    expect(component.success).toBe(
      'Cadastro realizado com sucesso! Redirecionando para login...'
    );

    await new Promise(resolve => setTimeout(resolve, 2100));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('onSubmit deve exibir mensagem de "usuário já existe" quando status for 409', (async () => {
    component.registerForm.setValue({
      username: 'joao',
      password: 'senha123',
      role: 'USER',
    });
    authServiceSpy.register.mockReturnValue(throwError(() => new Error('Usuário já existe')));

    component.onSubmit();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('Usuário já existe');
    expect(component.success).toBeNull();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('onSubmit deve exibir mensagem genérica em caso de outro erro', (async () => {
    component.registerForm.setValue({
      username: 'joao',
      password: 'senha123',
      role: 'USER',
    });
    authServiceSpy.register.mockReturnValue(throwError({ status: 500 }));

    component.onSubmit();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('Erro ao registrar usuário');
    expect(component.success).toBeNull();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('template deve exibir mensagens de erro e sucesso corretamente', (async () => {
    component.error = 'Erro qualquer';
    fixture.detectChanges();
    let errorElem = fixture.debugElement.query(By.css('p.error-message'));
    expect(errorElem).toBeTruthy();
    expect(errorElem.nativeElement.textContent).toContain('Erro qualquer');

    component.error = null;
    component.success = 'Tudo OK';
    fixture.detectChanges();
    const successElem = fixture.debugElement.query(By.css('p.success-message'));
    expect(successElem).toBeTruthy();
    expect(successElem.nativeElement.textContent).toContain('Tudo OK');
  }));
});
