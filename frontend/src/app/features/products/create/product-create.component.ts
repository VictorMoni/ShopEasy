import { createProductForm } from '../form/product-form.factory';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { ProductRequest } from '../product.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isAdmin = false;
  loading = false;
  error: string | null = null;
  private subscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.isAdmin$.subscribe((isAdm) => {
      this.isAdmin = isAdm;
      if (!isAdm) {
        this.router.navigate(['/products']);
      }
    });

    this.productForm = createProductForm(this.fb);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;
    const dto: ProductRequest = this.productForm.value;

    this.productService.create(dto).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error = 'Erro ao criar produto. Verifique os dados.';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
