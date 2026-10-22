import { FormBuilder, Validators } from '@angular/forms';
import { ProductRequest } from '../product.model';

export function createProductForm(
  builder: FormBuilder,
  initialData?: ProductRequest,
) {
  return builder.group({
    name: [
      initialData?.name ?? '',
      [Validators.required, Validators.maxLength(100)],
    ],
    description: [initialData?.description ?? '', Validators.maxLength(1000)],
    price: [initialData?.price ?? 0, [Validators.required, Validators.min(0)]],
    stock: [initialData?.stock ?? 0, [Validators.required, Validators.min(0)]],
  });
}
