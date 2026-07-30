import { z } from "zod";

export const otpPurposes = [
  "email_verification",
  "login_2fa",
  "password_reset",
  "email_change",
] as const;
export const otpPurposeSchema = z.enum(otpPurposes);

export const requestOtpSchema = z.object({
  email: z.email("Must be a valid email"),
  purpose: otpPurposeSchema,
});

export const verifyOtpSchema = z.object({
  email: z.email("Must be a valid email"),
  purpose: otpPurposeSchema,
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only digits"),
});

export const loginSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "merchant"]).default("user"),
  verificationToken: z
    .string()
    .min(1, "Email verification is required before registering"),
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

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string(),
    agreedToTerms: z.literal(true, {
      error: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type OtpPurpose = z.infer<typeof otpPurposeSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
