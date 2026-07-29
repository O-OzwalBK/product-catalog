import { z } from "zod";
export declare const productSchema: z.ZodObject<{
    id: z.ZodNumber;
    stock: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    category: z.ZodString;
    imageUrl: z.ZodURL;
    price: z.ZodString;
    rating: z.ZodString;
    shortDescription: z.ZodString;
    longDescription: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, z.core.$strip>;
export declare const productListResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        stock: z.ZodNumber;
        name: z.ZodString;
        slug: z.ZodString;
        category: z.ZodString;
        imageUrl: z.ZodURL;
        price: z.ZodString;
        rating: z.ZodString;
        shortDescription: z.ZodString;
        longDescription: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const cartLineSchema: z.ZodObject<{
    productId: z.ZodNumber;
    quantity: z.ZodNumber;
    product: z.ZodObject<{
        id: z.ZodNumber;
        stock: z.ZodNumber;
        name: z.ZodString;
        slug: z.ZodString;
        category: z.ZodString;
        imageUrl: z.ZodURL;
        price: z.ZodString;
        rating: z.ZodString;
        shortDescription: z.ZodString;
        longDescription: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>;
    lineTotal: z.ZodNumber;
}, z.core.$strip>;
export declare const cartResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        productId: z.ZodNumber;
        quantity: z.ZodNumber;
        product: z.ZodObject<{
            id: z.ZodNumber;
            stock: z.ZodNumber;
            name: z.ZodString;
            slug: z.ZodString;
            category: z.ZodString;
            imageUrl: z.ZodURL;
            price: z.ZodString;
            rating: z.ZodString;
            shortDescription: z.ZodString;
            longDescription: z.ZodString;
            createdAt: z.ZodString;
        }, z.core.$strip>;
        lineTotal: z.ZodNumber;
    }, z.core.$strip>>;
    total: z.ZodNumber;
}, z.core.$strip>;
export declare const authUserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodEmail;
}, z.core.$strip>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type CartLine = z.infer<typeof cartLineSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
