import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../product.model';
import { AuthService } from '../../auth/auth.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('ProductDetailComponent (ajustado)', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let authServiceSpy: Mocked<AuthService>;
  let productServiceSpy: Mocked<ProductService>;
  let routerSpy: Mocked<Router>;

  const mockProduct: Product = {
    id: 42,
    name: 'Produto Teste',
    description: 'Desc teste',
    price: 100,
    stock: 5,
    category: 'CAT',
    createdAt: '03/06/2025 15:00',
  };

  beforeEach((async () => {
    const authSpy = createMock('AuthService', [], {
      isAdmin$: of(true),
    });

    const prodSpy = createMock('ProductService', [
      'getById',
      'update',
      'delete',
    ]);

    const rtrSpy = createMock('Router', ['navigate']);

    const defaultRouteStub = {
      snapshot: {
        paramMap: { get: (key: string) => (key === 'id' ? '42' : null) },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        ProductDetailComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ProductService, useValue: prodSpy },
        { provide: Router, useValue: rtrSpy },
        { provide: ActivatedRoute, useValue: defaultRouteStub },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;
    productServiceSpy = TestBed.inject(
      ProductService
    ) as Mocked<ProductService>;
    routerSpy = TestBed.inject(Router) as Mocked<Router>;

    productServiceSpy.getById.mockReturnValue(of(mockProduct));
  }));

  beforeEach((async () => {
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
  }));

  it('deve criar o componente e carregar produto', () => {
    expect(component).toBeTruthy();
    expect(component.productId).toBe(42);
    expect(productServiceSpy.getById).toHaveBeenCalledWith(42);
    expect(component.product).toEqual(mockProduct);
    expect(component.loading).toBe(false);

    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
  });

  it('ngOnInit com id inválido deve exibir erro e não chamar getById', (async () => {
    productServiceSpy.getById.mockClear();
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('abc');
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('ID de produto inválido.');
    expect(productServiceSpy.getById).not.toHaveBeenCalled();
  }));

  it('loadProduct com erro 404 deve exibir mensagem "Produto não encontrado."', (async () => {
    component.productId = 99;
    productServiceSpy.getById.mockReturnValue(throwError({ status: 404 }));

    component.loadProduct();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('Produto não encontrado.');
    expect(component.loading).toBe(false);
  }));

  it('enableEdit() deve ativar editMode e limpar error', () => {
    component.error = 'teste';
    component.enableEdit();
    expect(component.editMode).toBe(true);
    expect(component.error).toBeNull();
  });

  it('cancelEdit() deve desativar editMode e recarregar produto', (async () => {
    component.productForm.patchValue({
      name: 'Outro',
      price: 0,
      stock: 0,
      description: '',
    });

    productServiceSpy.getById.mockClear();
    productServiceSpy.getById.mockReturnValue(of(mockProduct));

    component.editMode = true;
    component.cancelEdit();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.editMode).toBe(false);
    expect(productServiceSpy.getById).toHaveBeenCalledWith(42);
  }));

  it('saveChanges() com sucesso deve atualizar product e sair de editMode', (async () => {
    component.editMode = true;

    component.productForm.setValue({
      name: 'Alterado',
      description: 'Desc alterado',
      price: 200,
      stock: 10,
    });

    const updatedProduct: Product = {
      id: 42,
      name: 'Alterado',
      description: 'Desc alterado',
      price: 200,
      stock: 10,
      category: 'CAT',
      createdAt: '03/06/2025 15:00',
    };
    productServiceSpy.update.mockReturnValue(of(updatedProduct));

    component.saveChanges();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(productServiceSpy.update).toHaveBeenCalledWith(42, {
      name: 'Alterado',
      description: 'Desc alterado',
      price: 200,
      stock: 10,
    });
    expect(component.product).toEqual(updatedProduct);
    expect(component.editMode).toBe(false);
    expect(component.loading).toBe(false);
  }));

  it('saveChanges() com erro deve exibir mensagem e manter editMode', (async () => {
    component.editMode = true;
    component.productForm.setValue({
      name: 'Alterado',
      description: 'Desc',
      price: 200,
      stock: 10,
    });
    productServiceSpy.update.mockReturnValue(throwError({}));

    component.saveChanges();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('Falha ao atualizar produto.');
    expect(component.editMode).toBe(true);
    expect(component.loading).toBe(false);
  }));

  it('deleteProduct() cancelado no confirm não deve chamar delete()', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteProduct();
    expect(productServiceSpy.delete).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('deleteProduct() com confirm true deve chamar delete e navegar', (async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    productServiceSpy.delete.mockReturnValue(of(undefined));

    component.deleteProduct();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(productServiceSpy.delete).toHaveBeenCalledWith(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('deleteProduct() com erro deve exibir mensagem de erro', (async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    productServiceSpy.delete.mockReturnValue(throwError({}));

    component.deleteProduct();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.error).toBe('Falha ao excluir produto.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('goBack() deve navegar para /products', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});
