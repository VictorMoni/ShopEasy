import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
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
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: 42,
    name: 'Produto Teste',
    description: 'Desc teste',
    price: 100,
    stock: 5,
    category: 'CAT',
    createdAt: '03/06/2025 15:00',
  };

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAdmin$: of(true),
    });

    const prodSpy = jasmine.createSpyObj('ProductService', [
      'getById',
      'update',
      'delete',
    ]);

    const rtrSpy = jasmine.createSpyObj('Router', ['navigate']);

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

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productServiceSpy = TestBed.inject(
      ProductService
    ) as jasmine.SpyObj<ProductService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    productServiceSpy.getById.and.returnValue(of(mockProduct));
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  it('deve criar o componente e carregar produto', () => {
    expect(component).toBeTruthy();
    expect(component.productId).toBe(42);
    expect(productServiceSpy.getById).toHaveBeenCalledWith(42);
    expect(component.product).toEqual(mockProduct);
    expect(component.loading).toBeFalse();

    expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
  });

  it('ngOnInit com id inválido deve exibir erro e não chamar getById', fakeAsync(() => {
    productServiceSpy.getById.calls.reset();
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('abc');
    component.ngOnInit();
    tick();

    expect(component.error).toBe('ID de produto inválido.');
    expect(productServiceSpy.getById).not.toHaveBeenCalled();
  }));

  it('loadProduct com erro 404 deve exibir mensagem "Produto não encontrado."', fakeAsync(() => {
    component.productId = 99;
    productServiceSpy.getById.and.returnValue(throwError({ status: 404 }));

    component.loadProduct();
    tick();

    expect(component.error).toBe('Produto não encontrado.');
    expect(component.loading).toBeFalse();
  }));

  it('enableEdit() deve ativar editMode e limpar error', () => {
    component.error = 'teste';
    component.enableEdit();
    expect(component.editMode).toBeTrue();
    expect(component.error).toBeNull();
  });

  it('cancelEdit() deve desativar editMode e recarregar produto', fakeAsync(() => {
    component.productForm.patchValue({
      name: 'Outro',
      price: 0,
      stock: 0,
      description: '',
    });

    productServiceSpy.getById.calls.reset();
    productServiceSpy.getById.and.returnValue(of(mockProduct));

    component.editMode = true;
    component.cancelEdit();
    tick();

    expect(component.editMode).toBeFalse();
    expect(productServiceSpy.getById).toHaveBeenCalledWith(42);
  }));

  it('saveChanges() com sucesso deve atualizar product e sair de editMode', fakeAsync(() => {
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
    productServiceSpy.update.and.returnValue(of(updatedProduct));

    component.saveChanges();
    tick();

    expect(productServiceSpy.update).toHaveBeenCalledWith(42, {
      name: 'Alterado',
      description: 'Desc alterado',
      price: 200,
      stock: 10,
    });
    expect(component.product).toEqual(updatedProduct);
    expect(component.editMode).toBeFalse();
    expect(component.loading).toBeFalse();
  }));

  it('saveChanges() com erro deve exibir mensagem e manter editMode', fakeAsync(() => {
    component.editMode = true;
    component.productForm.setValue({
      name: 'Alterado',
      description: 'Desc',
      price: 200,
      stock: 10,
    });
    productServiceSpy.update.and.returnValue(throwError({}));

    component.saveChanges();
    tick();

    expect(component.error).toBe('Falha ao atualizar produto.');
    expect(component.editMode).toBeTrue();
    expect(component.loading).toBeFalse();
  }));

  it('deleteProduct() cancelado no confirm não deve chamar delete()', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteProduct();
    expect(productServiceSpy.delete).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('deleteProduct() com confirm true deve chamar delete e navegar', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    productServiceSpy.delete.and.returnValue(of(undefined));

    component.deleteProduct();
    tick();

    expect(productServiceSpy.delete).toHaveBeenCalledWith(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  }));

  it('deleteProduct() com erro deve exibir mensagem de erro', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    productServiceSpy.delete.and.returnValue(throwError({}));

    component.deleteProduct();
    tick();

    expect(component.error).toBe('Falha ao excluir produto.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));

  it('goBack() deve navegar para /products', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});
