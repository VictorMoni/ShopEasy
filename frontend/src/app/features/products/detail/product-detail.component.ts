import { createProductForm } from '../form/product-form.factory';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { Product, ProductRequest } from '../product.model';
import { AuthService } from '../../../features/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productId!: number;
  product!: Product;
  loading = false;
  error: string | null = null;
  isAdmin = false;

  editMode = false;
  productForm!: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const subRole = this.authService.isAdmin$.subscribe((isAdm) => {
      this.isAdmin = isAdm;
    });
    this.subscriptions.push(subRole);

    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.productId)) {
      this.error = 'ID de produto inválido.';
      return;
    }
    this.loadProduct();

    this.productForm = createProductForm(this.fb);
  }

  loadProduct(): void {
    this.loading = true;
    this.error = null;
    const sub = this.productService.getById(this.productId).subscribe({
      next: (prod) => {
        this.product = prod;

        if (this.isAdmin) {
          this.productForm.patchValue({
            name: prod.name,
            description: prod.description || '',
            price: prod.price,
            stock: prod.stock,
          });
        }
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.error = 'Produto não encontrado.';
        } else {
          this.error = 'Erro ao carregar produto.';
        }
        this.loading = false;
      },
    });
    this.subscriptions.push(sub);
  }

  enableEdit(): void {
    this.editMode = true;
    this.error = null;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadProduct();
  }

  saveChanges(): void {
    if (this.productForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;
    const dto: ProductRequest = this.productForm.value;

    const sub = this.productService.update(this.productId, dto).subscribe({
      next: (updatedProd) => {
        this.product = updatedProd;
        this.editMode = false;
        this.loading = false;
      },
      error: () => {
        this.error = 'Falha ao atualizar produto.';
        this.loading = false;
      },
    });
    this.subscriptions.push(sub);
  }

  deleteProduct(): void {
    if (!confirm('Deseja realmente excluir este produto?')) {
      return;
    }
    const sub = this.productService.delete(this.productId).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: () => {
        this.error = 'Falha ao excluir produto.';
      },
    });
    this.subscriptions.push(sub);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
