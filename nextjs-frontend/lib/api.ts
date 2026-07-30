import type {
  AuthUser,
  CartResponse,
  CreateProductInput,
  LoginInput,
  OtpPurpose,
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

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach((element) => {
        document.cookie = element
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      window.location.href = "/login";
    }

    throw new Error("Session invalid. Please login again.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    const message =
      typeof body?.error?.message === "string"
        ? body.error.message
        : typeof body?.error === "string"
          ? body.error
          : JSON.stringify(
              body?.error ?? body ?? `Request failed: ${response.status}`,
            );

    throw new Error(message);
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
  productId: number,
  input: UpdateProductInput,
) =>
  apiFetch<{ data: Product }>(`/api/products/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });

export const deleteProduct = (token: string, productId: number) =>
  apiFetch(`/api/products/${productId}`, {
    method: "DELETE",
    token,
  });

export const requestOtp = (email: string, purpose: OtpPurpose) =>
  apiFetch<{ message: string }>("/api/otp/request", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });

export const verifyOtp = (email: string, purpose: OtpPurpose, code: string) =>
  apiFetch<{ verified: true; verificationToken?: string }>("/api/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, purpose, code }),
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
