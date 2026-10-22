import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { ProductCreateComponent } from './product-create.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { AuthService } from '../../auth/auth.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;
  let fixture: ComponentFixture<ProductCreateComponent>;
  let authServiceSpy: Mocked<AuthService>;
  let productServiceSpy: Mocked<ProductService>;
  let routerSpy: Mocked<Router>;

  beforeEach((async () => {
    const aSpy = createMock('AuthService', [], {
      isAdmin$: of(false),
    });
    const pSpy = createMock('ProductService', ['create']);
    const rSpy = createMock('Router', ['navigate']);
    const routeStub = {
      snapshot: {
        paramMap: { get: (key: string) => null },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        ProductCreateComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: aSpy },
        { provide: ProductService, useValue: pSpy },
        { provide: Router, useValue: rSpy },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;
    productServiceSpy = TestBed.inject(
      ProductService
    ) as Mocked<ProductService>;
    routerSpy = TestBed.inject(Router) as Mocked<Router>;
  }));

  it('se isAdmin$ emitir false, deve redirecionar para /products', (async () => {
    fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  }));
});
