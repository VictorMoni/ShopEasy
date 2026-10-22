import { ProductFiltersComponent } from '../../products/filters/product-filters.component';
import { emptyProductFilters } from '../../products/filters/product-filters.model';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../products/product.service';
import { Product } from '../../products/product.model';
import { OrderService } from '../order.service';
import { OrderRequest, OrderItemRequest, CartItem } from '../order.model';
import { Router } from '@angular/router';
import { PageProductResponse } from '../../products/product.model';
import { Observable, BehaviorSubject, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-create',
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss'],
  standalone: true,
  imports: [CommonModule, ProductFiltersComponent],
})
export class OrderCreateComponent implements OnInit {
  produtos$!: Observable<PageProductResponse>;
  filterTrigger$ = new BehaviorSubject<void>(undefined);
  error: string | null = null;

  cart: CartItem[] = [];
  loadingSubmit = false;

  filters = emptyProductFilters();
  page = 0;
  size = 10;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.produtos$ = this.filterTrigger$.pipe(
      switchMap(() =>
        this.productService
          .list(
            this.filters.name,
            this.filters.category,
            this.filters.minPrice,
            this.filters.maxPrice,
            this.page,
            this.size,
          )
          .pipe(
            catchError((_) => {
              this.error = 'Erro ao carregar produtos.';
              return of({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                size: this.size,
              });
            }),
          ),
      ),
    );
  }

  onSearch(): void {
    this.page = 0;
    this.error = null;
    this.filterTrigger$.next();
  }

  clearFilters(): void {
    this.filters = emptyProductFilters();
    this.page = 0;
    this.error = null;
    this.filterTrigger$.next();
  }

  changePage(delta: number): void {
    this.page = this.page + delta;
    if (this.page < 0) this.page = 0;
    this.error = null;
    this.filterTrigger$.next();
  }

  addToCart(product: Product, quantityInput: HTMLInputElement): void {
    const qty = parseInt(quantityInput.value, 10);
    if (!qty || qty <= 0 || qty > product.stock) {
      this.error = 'Quantidade inválida.';
      return;
    }
    this.error = null;
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({ product, quantity: qty });
    }
    quantityInput.value = '';
  }

  removeFromCart(productId: number): void {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
  }

  getCartTotal(): number {
    return this.cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  }

  submitOrder(): void {
    if (!this.cart.length) {
      this.error = 'O pedido deve conter ao menos um item.';
      return;
    }
    this.error = null;
    this.loadingSubmit = true;

    const items: OrderItemRequest[] = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));
    const orderRequest: OrderRequest = { items };

    this.orderService.create(orderRequest).subscribe({
      next: () => {
        this.loadingSubmit = false;
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.error = 'Erro ao criar pedido. ' + (err.error?.message || '');
        this.loadingSubmit = false;
      },
    });
  }
}
