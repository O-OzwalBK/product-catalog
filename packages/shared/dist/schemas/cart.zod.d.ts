import { z } from "zod";
export declare const addToCartSchema: z.ZodObject<{
    productId: z.ZodCoercedNumber<unknown>;
    quantity: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const productIdParamSchema: z.ZodObject<{
    productId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
