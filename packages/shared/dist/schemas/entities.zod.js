"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUserSchema = exports.cartResponseSchema = exports.cartLineSchema = exports.productListResponseSchema = exports.paginationSchema = exports.productSchema = void 0;
const zod_1 = require("zod");
exports.productSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    stock: zod_1.z.number().int().nonnegative(),
    name: zod_1.z.string().min(1, "Name is required."),
    slug: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    imageUrl: zod_1.z.url(),
    price: zod_1.z.string().min(1),
    rating: zod_1.z.string(),
    shortDescription: zod_1.z.string(),
    longDescription: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive(),
    limit: zod_1.z.number().int().positive(),
    total: zod_1.z.number().int().nonnegative(),
    totalPages: zod_1.z.number().int().nonnegative(),
});
exports.productListResponseSchema = zod_1.z.object({
    data: zod_1.z.array(exports.productSchema),
    pagination: exports.paginationSchema,
});
exports.cartLineSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive(),
    product: exports.productSchema,
    lineTotal: zod_1.z.number(),
});
exports.cartResponseSchema = zod_1.z.object({
    data: zod_1.z.array(exports.cartLineSchema),
    total: zod_1.z.number(),
});
// Auth user (the shape returned alongside a JWT on register/login)
exports.authUserSchema = zod_1.z.object({
    id: zod_1.z.string(), // uuid
    name: zod_1.z.string(),
    email: zod_1.z.email(),
});
//# sourceMappingURL=entities.zod.js.map