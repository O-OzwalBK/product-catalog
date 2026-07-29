import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const productIdParamSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive("Product ID must be a positive number"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
