export interface Product {
    id: number,
    name: string,
    category: string,
    imageUrl: string,
    price: string,
    stock:number,
    rating: string,
    shortDescription: string,
    longDescription: string,
    slug: string,
    createdAt: string
}

export interface Pagination { 
page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

export interface CartLine {
  productId: number;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface CartResponse {
  data: CartLine[];
  total: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}