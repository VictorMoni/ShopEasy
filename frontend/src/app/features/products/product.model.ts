export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  createdAt?: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export type ProductResponse = Product;

// Representa o JSON de Page<ProductResponse> do backend:
export interface PageProductResponse {
  content: ProductResponse[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0‐based)
  size: number; // tamanho da página
  // outras propriedades de Page do Spring podem vir aqui, se quiser (por simplicidade, listamos as principais)
}
