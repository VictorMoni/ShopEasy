import { createProductForm } from './product-form.factory';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductRequest } from '../product.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ProductFormComponent implements OnInit {
  @Input() initialData?: ProductRequest;
  @Output() saved = new EventEmitter<ProductRequest>();

  productForm!: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.productForm = createProductForm(this.fb, this.initialData);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    this.saved.emit(this.productForm.value);
  }
}
