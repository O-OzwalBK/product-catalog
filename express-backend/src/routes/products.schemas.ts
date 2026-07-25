import { z } from "zod";

// Everything arrives from req.query as a string (or string[]), so every
// field here either coerces or transforms into the type the controller
// actually wants to work with.
export const listProductsQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    // "Electronics,Home" -> ["Electronics", "Home"] for a multi-select filter
    category: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined
      ),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(["price_asc", "price_desc", "rating_desc"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] }
  );

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});
