import { vi, type Mocked } from 'vitest';
import { createMock } from '../../../testing/mocks';
// src/app/features/orders/order.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { OrderService } from './order.service';
import { OrderRequest, OrderResponse } from './order.model';
import { environment } from '../../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpSpy: Mocked<HttpClient>;

  const baseUrl = `${environment.apiUrl}/api/orders`;

  beforeEach(() => {
    httpSpy = createMock('HttpClient', ['post', 'get']);

    TestBed.configureTestingModule({
      providers: [OrderService, { provide: HttpClient, useValue: httpSpy }],
    });

    service = TestBed.inject(OrderService);
  });

  it('deve criar um pedido (POST /api/orders)', () => {
    const orderReq: OrderRequest = {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    };
    const mockResponse: OrderResponse = {
      id: 42,
      createdAt: '03/06/2025 14:00',
      total: 150,
      items: [
        {
          id: 101,
          productId: 1,
          productName: 'X',
          quantity: 2,
          unitPrice: 50,
          total: 100,
        },
        {
          id: 102,
          productId: 2,
          productName: 'Y',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ],
    };
    httpSpy.post.mockReturnValue(of(mockResponse));

    let result: OrderResponse | undefined;
    service.create(orderReq).subscribe((res) => (result = res));

    expect(httpSpy.post).toHaveBeenCalledWith(baseUrl, orderReq);
    expect(result).toEqual(mockResponse);
  });

  it('deve listar meus pedidos (GET /api/orders/me?page=0&size=10)', () => {
    const mockPage: { content: OrderResponse[]; totalElements: number } = {
      content: [
        {
          id: 1,
          createdAt: '03/06/2025 10:00',
          total: 100,
          items: [],
        },
      ],
      totalElements: 1,
    };
    const expectedUrl = `${baseUrl}/me?page=0&size=10`;
    httpSpy.get.mockReturnValue(of(mockPage));

    let result: typeof mockPage | undefined;
    service.listMyOrders().subscribe((res) => (result = res));

    expect(httpSpy.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockPage);
  });

  it('deve listar meus pedidos com página e tamanho personalizados', () => {
    const mockPage: { content: OrderResponse[]; totalElements: number } = {
      content: [],
      totalElements: 0,
    };
    const page = 2;
    const size = 5;
    const expectedUrl = `${baseUrl}/me?page=${page}&size=${size}`;
    httpSpy.get.mockReturnValue(of(mockPage));

    let result: typeof mockPage | undefined;
    service.listMyOrders(page, size).subscribe((res) => (result = res));

    expect(httpSpy.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockPage);
  });

  it('deve buscar pedido por ID (GET /api/orders/{id})', () => {
    const mockOrder: OrderResponse = {
      id: 99,
      createdAt: '03/06/2025 11:00',
      total: 200,
      items: [],
    };
    const id = 99;
    const expectedUrl = `${baseUrl}/${id}`;
    httpSpy.get.mockReturnValue(of(mockOrder));

    let result: OrderResponse | undefined;
    service.getOrderById(id).subscribe((res) => (result = res));

    expect(httpSpy.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockOrder);
  });
});
