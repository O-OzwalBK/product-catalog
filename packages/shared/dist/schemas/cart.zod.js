"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdParamSchema = exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.coerce.number().int().positive(),
    quantity: zod_1.z.coerce.number().int().positive().default(1),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.coerce.number().int().positive(),
});
exports.productIdParamSchema = zod_1.z.object({
    productId: zod_1.z.coerce.number().int().positive(),
});
//# sourceMappingURL=cart.zod.js.map