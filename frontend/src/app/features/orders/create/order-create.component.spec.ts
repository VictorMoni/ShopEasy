import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { OrderCreateComponent } from './order-create.component';
import { ProductService } from '../../products/product.service';
import { OrderService } from '../order.service';
import { PageProductResponse } from '../../products/product.model';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('OrderCreateComponent', () => {
  let component: OrderCreateComponent;
  let fixture: ComponentFixture<OrderCreateComponent>;
  let productServiceSpy: Mocked<ProductService>;
  let orderServiceSpy: Mocked<OrderService>;
  let routerSpy: Mocked<Router>;

  const dummyPage: PageProductResponse = {
    content: [
      {
        id: 1,
        name: 'Item A',
        description: 'Desc A',
        price: 10.0,
        stock: 5,
        category: 'CAT1',
        createdAt: '02/06/2025 10:00',
      },
      {
        id: 2,
        name: 'Item B',
        description: 'Desc B',
        price: 20.0,
        stock: 3,
        category: 'CAT2',
        createdAt: '02/06/2025 11:00',
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
  };

  beforeEach(async () => {
    const prodSpy = createMock('ProductService', ['list']);
    const ordSpy = createMock('OrderService', ['create']);
    const rtrSpy = createMock('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: ProductService, useValue: prodSpy },
        { provide: OrderService, useValue: ordSpy },
        { provide: Router, useValue: rtrSpy },
      ],
    }).compileComponents();

    productServiceSpy = TestBed.inject(
      ProductService
    ) as Mocked<ProductService>;
    orderServiceSpy = TestBed.inject(
      OrderService
    ) as Mocked<OrderService>;
    routerSpy = TestBed.inject(Router) as Mocked<Router>;

    productServiceSpy.list.mockReturnValue(of(dummyPage));

    fixture = TestBed.createComponent(OrderCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente e carregar produtos via produtos$', (async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(productServiceSpy.list).toHaveBeenCalledWith(
      '',
      '',
      undefined,
      undefined,
      0,
      10
    );

    component.produtos$.subscribe((pageData) => {
      expect(pageData).toEqual(dummyPage);
    });

    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
    expect(rows.length).toBe(2);

    const primeiraCelula = rows[0].query(By.css('td')).nativeElement
      .textContent;
    expect(primeiraCelula).toContain('Item A');
  }));

  it('addToCart deve adicionar item válido e limpar input', () => {
    const produto = dummyPage.content[0];
    const input = document.createElement('input');
    input.value = '2';

    component.addToCart(produto, input);
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].quantity).toBe(2);
    expect(input.value).toBe('');
    expect(component.error).toBeNull();
  });

  it('submitOrder com itens válidos deve chamar orderService.create e navegar', (async () => {
    const produto = dummyPage.content[0];
    component.cart = [{ product: produto, quantity: 1 }];

    const mockOrderResponse = {
      id: 123,
      createdAt: '03/06/2025 15:00',
      total: 10.0,
      items: [
        {
          id: 1,
          productId: produto.id,
          productName: produto.name,
          quantity: 1,
          unitPrice: produto.price,
          total: produto.price,
        },
      ],
    };
    orderServiceSpy.create.mockReturnValue(of(mockOrderResponse));

    component.submitOrder();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(orderServiceSpy.create).toHaveBeenCalledWith({
      items: [{ productId: produto.id, quantity: 1 }],
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/orders']);
  }));

  it('submitOrder se orderService.create falhar deve exibir mensagem de erro', (async () => {
    const produto = dummyPage.content[0];
    component.cart = [{ product: produto, quantity: 1 }];

    orderServiceSpy.create.mockReturnValue(
      throwError({ error: { message: 'Falha' } })
    );

    component.submitOrder();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.error).toContain('Erro ao criar pedido.');
    expect(component.loadingSubmit).toBe(false);
  }));
});
