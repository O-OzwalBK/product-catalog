import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});
