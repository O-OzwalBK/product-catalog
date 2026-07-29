"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFormSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email("Must be a valid email"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100),
    email: zod_1.z.email("Must be a valid email"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
/*
Frontend-only extension
The register *form* collects two fields the backend does not know of: confirmPassword and agreedToTerms.
The naive move is to export registerSchema and use it directly for the form —
but that silently drops all client-side validation of those two fields,
which puts you right back to hand-rolled `if (password !== confirmPassword)` checks
in the component, the exact duplication this refactor is meant to remove.

Fix: extend the base schema with the extra fields, THEN refine.
Order matters — .refine() wraps the schema in a type that no longer exposes .extend(),
so extending first and refining second is the only order that works.
*/
exports.registerFormSchema = exports.registerSchema
    .extend({
    confirmPassword: zod_1.z.string(),
    agreedToTerms: zod_1.z.literal(true, {
        error: "You must agree to the Terms of Service and Privacy Policy",
    }),
})
    .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
});
//# sourceMappingURL=auth.zod.js.map