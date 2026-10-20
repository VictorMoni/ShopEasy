export interface ProductFilters {
  name: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
}

export function emptyProductFilters(): ProductFilters {
  return { name: '', category: '', minPrice: undefined, maxPrice: undefined };
}
