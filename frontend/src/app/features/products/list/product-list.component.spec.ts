import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
registerLocaleData(localePt);
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../product.service';
import { PageProductResponse } from '../product.model';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const dummyPage: PageProductResponse = {
    content: [
      {
        id: 1,
        name: 'Produto X',
        description: 'Desc X',
        price: 10.0,
        stock: 5,
        category: 'CATX',
        createdAt: '02/06/2025 10:00',
      },
      {
        id: 2,
        name: 'Produto Y',
        description: 'Desc Y',
        price: 20.0,
        stock: 3,
        category: 'CATY',
        createdAt: '02/06/2025 11:00',
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
  };

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('ProductService', ['list']);

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: spy },
        { provide: AuthService, useValue: { isAdmin$: of(false) } },
      ],
    }).compileComponents();

    productServiceSpy = TestBed.inject(
      ProductService,
    ) as jasmine.SpyObj<ProductService>;

    productServiceSpy.list.and.returnValue(of(dummyPage));

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar ProductService.list() no ngOnInit', () => {
    expect(productServiceSpy.list).toHaveBeenCalledWith(
      '',
      '',
      undefined,
      undefined,
      0,
      10,
    );
  });

  it('deve preencher products com pageData.content', () => {
    expect(component.products.length).toBe(2);
    expect(component.products[0].name).toBe('Produto X');
    expect(component.totalPages).toBe(1);
    expect(component.totalElements).toBe(2);
  });

  it('deve exibir um card com nome e preço para cada produto', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.product-card'));
    expect(rows.length).toBe(2);

    const primeiraCelula = rows[0].query(By.css('h3')).nativeElement
      .textContent;
    expect(primeiraCelula).toContain('Produto X');
  });

  it('ao chamar changePage, deve requisitar nova lista com page atualizada', () => {
    const newPage: PageProductResponse = {
      content: [
        {
          id: 3,
          name: 'Produto Z',
          description: 'Desc Z',
          price: 30.0,
          stock: 2,
          category: 'CATZ',
          createdAt: '02/06/2025 12:00',
        },
      ],
      totalElements: 3,
      totalPages: 2,
      number: 1,
      size: 10,
    };

    productServiceSpy.list.calls.reset();
    productServiceSpy.list.and.returnValue(of(newPage));

    component.totalPages = 2;
    component.changePage(1);
    expect(component.page).toBe(1);
    expect(productServiceSpy.list).toHaveBeenCalledWith(
      '',
      '',
      undefined,
      undefined,
      1,
      10,
    );

    fixture.detectChanges();
    expect(component.products[0].name).toBe('Produto Z');
  });

  it('deve enviar os filtros digitados e reiniciar a página ao buscar', async () => {
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input[name="search"]'))
      .nativeElement as HTMLInputElement;
    input.value = 'Caderno';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    component.page = 2;
    fixture.debugElement
      .query(By.css('form.filters-container'))
      .triggerEventHandler('ngSubmit', null);
    expect(productServiceSpy.list).toHaveBeenCalledWith(
      'Caderno',
      '',
      undefined,
      undefined,
      0,
      10,
    );
  });

  it('deve limpar os filtros pela interface e recarregar a primeira página', async () => {
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input[name="search"]'))
      .nativeElement as HTMLInputElement;
    input.value = 'Caderno';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
    component.page = 2;
    fixture.debugElement
      .query(By.css('form.filters-container button[type="button"]'))
      .nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(productServiceSpy.list).toHaveBeenCalledWith(
      '',
      '',
      undefined,
      undefined,
      0,
      10,
    );
  });
});
