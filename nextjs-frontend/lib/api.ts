import type {
  AuthUser,
  CartResponse,
  CreateProductInput,
  LoginInput,
  Product,
  ProductListResponse,
  RegisterInput,
  UpdateCartItemInput,
  UpdateProductInput,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiFetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "Application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ?? `Request failed: ${response.status}`,
    );
  }

  if (response.status == 204) return undefined as T;
  return response.json();
}

export const getProducts = async (params: URLSearchParams) =>
  apiFetch<ProductListResponse>(`/api/products?${params.toString()}`);

export const getProductBySlug = (slug: string) =>
  apiFetch<{ data: Product }>(`/api/products/${slug}`);

export const createProduct = (token: string, input: CreateProductInput) =>
  apiFetch<{ data: Product }>("/api/products", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });

export const updateProduct = (
  token: string,
  id: number,
  input: UpdateProductInput,
) =>
  apiFetch<{ data: Product }>(`/api/products/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });

export const deleteProduct = (token: string, id: number) =>
  apiFetch(`/api/products/${id}`, {
    method: "DELETE",
    token,
  });

export const registerUser = (input: RegisterInput) =>
  apiFetch<{ user: AuthUser; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const loginUser = (input: LoginInput) =>
  apiFetch<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getCart = (token: string) =>
  apiFetch<CartResponse>("/api/cart", { token });

export const addToCart = (token: string, productId: number, quantity = 1) =>
  apiFetch("/api/cart", {
    method: "POST",
    token,
    body: JSON.stringify({ productId, quantity }),
  });

export const updateCartItem = (
  token: string,
  productId: number,
  quantity: number,
) =>
  apiFetch(`/api/cart/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (token: string, productId: number) =>
  apiFetch(`/api/cart/${productId}`, { method: "DELETE", token });
