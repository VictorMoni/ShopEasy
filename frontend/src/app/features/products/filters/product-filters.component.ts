import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductFilters } from './product-filters.model';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './product-filters.component.html',
  styles: [':host { display: contents; }'],
})
export class ProductFiltersComponent {
  @Input({ required: true }) filters!: ProductFilters;
  @Output() searchRequested = new EventEmitter<void>();
  @Output() clearRequested = new EventEmitter<void>();
}
