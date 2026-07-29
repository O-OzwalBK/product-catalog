"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugParamSchema = exports.listProductsQuerySchema = void 0;
const zod_1 = require("zod");
/*
Everything arrives from req.query as a string (or string[]), so every
field here either coerces or transforms into the type the controller
actually wants to work with.
*/
exports.listProductsQuerySchema = zod_1.z
    .object({
    search: zod_1.z.string().trim().min(1).optional(),
    category: zod_1.z
        .string()
        .optional()
        .transform((val) => val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined),
    minPrice: zod_1.z.coerce.number().nonnegative().optional(),
    maxPrice: zod_1.z.coerce.number().nonnegative().optional(),
    sort: zod_1.z.enum(["price_asc", "price_desc", "rating_desc"]).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(12),
})
    .refine((data) => data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.minPrice <= data.maxPrice, { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] });
exports.slugParamSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1),
});
//# sourceMappingURL=product.zod.js.map