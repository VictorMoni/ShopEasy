import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../../testing/mocks';
import {
  ComponentFixture,
  TestBed,
  } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../order.service';
import { AuthService } from '../../auth/auth.service';
import { OrderResponse } from '../order.model';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderServiceSpy: Mocked<OrderService>;
  let authServiceSpy: Mocked<AuthService>;

  const dummyOrders: OrderResponse[] = [
    {
      id: 1,
      createdAt: '2025-06-03T10:00:00',
      total: 150.0,
      items: [
        {
          id: 11,
          productId: 101,
          productName: 'Produto A',
          quantity: 2,
          unitPrice: 50.0,
          total: 100.0,
        },
        {
          id: 12,
          productId: 102,
          productName: 'Produto B',
          quantity: 1,
          unitPrice: 50.0,
          total: 50.0,
        },
      ],
    },
    {
      id: 2,
      createdAt: '2025-06-03T11:30:00',
      total: 80.0,
      items: [
        {
          id: 21,
          productId: 103,
          productName: 'Produto C',
          quantity: 2,
          unitPrice: 40.0,
          total: 80.0,
        },
      ],
    },
  ];

  const dummyPageResponse = {
    content: dummyOrders,
    totalElements: 2,
  };

  beforeEach((async () => {
    const orderSpy = createMock('OrderService', ['listMyOrders']);
    const authSpy = createMock('AuthService', [], {
      isLoggedIn$: of(true),
      isAdmin$: of(true),
    });

    TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientTestingModule],
      providers: [provideRouter([]),
        { provide: OrderService, useValue: orderSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    orderServiceSpy = TestBed.inject(
      OrderService
    ) as Mocked<OrderService>;
    authServiceSpy = TestBed.inject(AuthService) as Mocked<AuthService>;

    orderServiceSpy.listMyOrders.mockReturnValue(of(dummyPageResponse));

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit deve chamar listMyOrders com page=0 e size=10', () => {
    expect(orderServiceSpy.listMyOrders).toHaveBeenCalledWith(0, 10);
    expect(component.orders).toEqual(dummyOrders);
    expect(component.totalElements).toBe(2);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('deve exibir duas linhas na tabela de pedidos', () => {
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
    expect(rows.length).toBe(2);

    const firstCells = rows[0].queryAll(By.css('td'));
    expect(firstCells[0].nativeElement.textContent).toContain('1');
    expect(firstCells[1].nativeElement.textContent).toContain(
      '03/06/2025 10:00'
    );
    expect(firstCells[2].nativeElement.textContent).toContain('150,00');
    expect(firstCells[3].nativeElement.textContent).toContain('2 items');
  });

  it('deve mostrar mensagem de erro quando listMyOrders falhar', (async () => {
    orderServiceSpy.listMyOrders.mockReturnValue(throwError({ status: 500 }));
    component.loadOrders();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.error).toBe('Não foi possível carregar seus pedidos.');
    expect(component.loading).toBe(false);

    const errorElem = fixture.debugElement.query(By.css('.error-message'));
    expect(errorElem).toBeTruthy();
    expect(errorElem.nativeElement.textContent).toContain(
      'Não foi possível carregar seus pedidos.'
    );
  }));

  it('changePage deve chamar loadOrders com nova página válida', (async () => {
    const newPageResponse = { content: [], totalElements: 2 };
    orderServiceSpy.listMyOrders.mockClear();
    orderServiceSpy.listMyOrders.mockReturnValue(of(newPageResponse));

    component.page = 0;
    component.totalElements = 20;
    component.changePage(1);
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.page).toBe(1);
    expect(orderServiceSpy.listMyOrders).toHaveBeenCalledWith(1, 10);
    expect(component.orders).toEqual([]);
  }));

  it('changePage não deve avançar se nova página for negativa', (async () => {
    component.page = 0;
    component.changePage(-1);
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.page).toBe(0);
    expect(orderServiceSpy.listMyOrders).toHaveBeenCalledTimes(1);
  }));

  it('changePage não deve avançar além da última página', (async () => {
    component.page = 1;
    component.totalElements = 20;
    component.changePage(1);
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.page).toBe(1);
    expect(orderServiceSpy.listMyOrders).toHaveBeenCalledTimes(1);
  }));

  it('totalPages deve retornar ceil(totalElements/size)', () => {
    component.totalElements = 25;
    component.size = 10;
    expect(component.totalPages).toBe(3);
  });
});
