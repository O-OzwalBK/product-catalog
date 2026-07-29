import { z } from "zod";
export declare const listProductsQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string[] | undefined, string | undefined>>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodOptional<z.ZodEnum<{
        price_asc: "price_asc";
        price_desc: "price_desc";
        rating_desc: "rating_desc";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const slugParamSchema: z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strip>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;
