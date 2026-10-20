import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const prodSpy = jasmine.createSpyObj('ProductService', ['create']);
    const rtrSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ProductService, useValue: prodSpy },
        { provide: Router, useValue: rtrSpy },
      ],
    }).compileComponents();

    productServiceSpy = TestBed.inject(
      ProductService,
    ) as jasmine.SpyObj<ProductService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('form deve ser inválido inicialmente', () => {
    const form = component.productForm;
    expect(form.valid).toBeFalse();
    expect(form.get('name')?.value).toBe('');
    expect(form.get('description')?.value).toBe('');
    expect(form.get('price')?.value).toBe(0);
    expect(form.get('stock')?.value).toBe(0);
  });

  it('campo "name" deve ser obrigatório e ter no máximo 100 caracteres', () => {
    const nameControl = component.productForm.get('name')!;
    nameControl.setValue('');
    expect(nameControl.hasError('required')).toBeTrue();

    const longString = 'a'.repeat(101);
    nameControl.setValue(longString);
    expect(nameControl.hasError('maxlength')).toBeTrue();

    nameControl.setValue('Nome válido');
    expect(nameControl.valid).toBeTrue();
  });

  it('campo "description" deve ter no máximo 1000 caracteres', () => {
    const descControl = component.productForm.get('description')!;
    const longDesc = 'a'.repeat(1001);
    descControl.setValue(longDesc);
    expect(descControl.hasError('maxlength')).toBeTrue();

    descControl.setValue('Descrição aceitável');
    expect(descControl.valid).toBeTrue();
  });

  it('campo "price" deve ser obrigatório e maior ou igual a zero', () => {
    const priceControl = component.productForm.get('price')!;
    priceControl.setValue(null);
    expect(priceControl.hasError('required')).toBeTrue();

    priceControl.setValue(-10);
    expect(priceControl.hasError('min')).toBeTrue();

    priceControl.setValue(0);
    expect(priceControl.valid).toBeTrue();

    priceControl.setValue(25.5);
    expect(priceControl.valid).toBeTrue();
  });

  it('campo "stock" deve ser obrigatório e maior ou igual a zero', () => {
    const stockControl = component.productForm.get('stock')!;
    stockControl.setValue(null);
    expect(stockControl.hasError('required')).toBeTrue();

    stockControl.setValue(-5);
    expect(stockControl.hasError('min')).toBeTrue();

    stockControl.setValue(0);
    expect(stockControl.valid).toBeTrue();

    stockControl.setValue(10);
    expect(stockControl.valid).toBeTrue();
  });

  it('onSubmit não deve chamar service.create se form for inválido', () => {
    component.onSubmit();
    expect(productServiceSpy.create).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('onSubmit deve emitir os dados válidos sem chamar serviços ou navegar', () => {
    const value = {
      name: 'Produto X',
      description: 'Descrição X',
      price: 75,
      stock: 20,
    };
    component.productForm.setValue(value);
    const saved = spyOn(component.saved, 'emit');
    component.onSubmit();
    expect(saved).toHaveBeenCalledOnceWith(value);
    expect(productServiceSpy.create).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('deve preencher os valores iniciais recebidos para edição', () => {
    const value = {
      name: 'Produto Y',
      description: 'Descrição Y',
      price: 50,
      stock: 5,
    };
    component.initialData = value;
    component.ngOnInit();
    expect(component.productForm.value).toEqual(value);
  });

  it('template não deve exibir mensagem de erro inicialmente', () => {
    fixture.detectChanges();
    const errorElem = fixture.debugElement.query(By.css('p.error-message'));
    expect(errorElem).toBeNull();
  });

  it('template deve exibir mensagem de erro quando component.error for definido', () => {
    component.error = 'Falha no servidor';
    fixture.detectChanges();
    const errorElem = fixture.debugElement.query(By.css('p.error-message'));
    expect(errorElem).toBeTruthy();
    expect(errorElem.nativeElement.textContent).toContain('Falha no servidor');
  });
});
