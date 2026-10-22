import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

import { OrderDetailComponent } from './order-detail.component';
import { OrderService } from '../order.service';
import { OrderResponse, OrderItemResponse } from '../order.model';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let orderServiceSpy: Mocked<OrderService>;
  let routerSpy: Mocked<Router>;

  const mockOrder: OrderResponse = {
    id: 5,
    createdAt: '03/06/2025 12:00',
    total: 150,
    items: [
      {
        id: 1,
        productId: 10,
        productName: 'Produto A',
        quantity: 2,
        unitPrice: 50,
        total: 100,
      },
      {
        id: 2,
        productId: 11,
        productName: 'Produto B',
        quantity: 1,
        unitPrice: 50,
        total: 50,
      },
    ],
  };

  beforeEach((async () => {
    const orderSpy = createMock('OrderService', ['getOrderById']);
    const rtrSpy = createMock('Router', ['navigate']);

    const routeStub = {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? '5' : null),
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        { provide: OrderService, useValue: orderSpy },
        { provide: Router, useValue: rtrSpy },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    }).compileComponents();

    orderServiceSpy = TestBed.inject(
      OrderService
    ) as Mocked<OrderService>;
    routerSpy = TestBed.inject(Router) as Mocked<Router>;

    orderServiceSpy.getOrderById.mockReturnValue(of(mockOrder));

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  }));

  it('deve criar o componente e carregar pedido válido', (async () => {
    fixture.detectChanges();
    expect(component.orderId).toBe(5);
    expect(orderServiceSpy.getOrderById).toHaveBeenCalledWith(5);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(component.order).toEqual(mockOrder);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  }));

  it('ngOnInit com id inválido deve exibir erro e não chamar getOrderById', () => {
    const routeStubInvalid = {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? 'abc' : null),
        },
      },
    };
    Object.assign(TestBed.inject(ActivatedRoute), routeStubInvalid);

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.orderId).toBeNaN();
    expect(component.error).toBe('ID de pedido inválido.');
    expect(orderServiceSpy.getOrderById).not.toHaveBeenCalled();
  });

  it('loadOrder com erro 404 deve exibir "Pedido não encontrado."', (async () => {
    orderServiceSpy.getOrderById.mockReturnValue(
      throwError(() => ({ status: 404 }))
    );

    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.error).toBe('Pedido não encontrado.');
    expect(component.loading).toBe(false);
  }));

  it('loadOrder com erro 403 deve exibir "Você não tem permissão para ver este pedido."', (async () => {
    orderServiceSpy.getOrderById.mockReturnValue(
      throwError(() => ({ status: 403 }))
    );

    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.error).toBe(
      'Você não tem permissão para ver este pedido.'
    );
    expect(component.loading).toBe(false);
  }));

  it('loadOrder com outro erro deve exibir "Erro ao carregar pedido."', (async () => {
    orderServiceSpy.getOrderById.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.error).toBe('Erro ao carregar pedido.');
    expect(component.loading).toBe(false);
  }));

  it('getItemSubtotal deve retornar unitPrice * quantity', () => {
    const item: OrderItemResponse = {
      id: 1,
      productId: 10,
      productName: 'X',
      quantity: 3,
      unitPrice: 20,
      total: 60,
    };
    expect(component.getItemSubtotal(item)).toBe(60);
  });

  it('goBack deve chamar router.navigate(["/orders"])', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/orders']);
  });
});
