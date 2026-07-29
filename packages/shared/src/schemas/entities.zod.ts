import { z } from "zod";

export const productSchema = z.object({
  productId: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  name: z.string().min(1, "Name is required."),
  slug: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z
    .string()
    .refine((val) => val.startsWith("http") || val.startsWith("data:image/"), {
      message: "Must be a valid URL or Base64 image",
    }),
  price: z.string().min(1),
  rating: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  createdAt: z.string(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const productListResponseSchema = z.object({
  data: z.array(productSchema),
  pagination: paginationSchema,
});

export const cartLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  product: productSchema,
  lineTotal: z.number(),
});

export const cartResponseSchema = z.object({
  data: z.array(cartLineSchema),
  total: z.number(),
});

// Auth user (the shape returned alongside a JWT on register/login)

export const authUserSchema = z.object({
  id: z.string(), // uuid
  name: z.string(),
  email: z.email(),
  role: z.enum(["user", "merchant"]),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
