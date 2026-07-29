import { z } from "zod";

/*
Everything arrives from req.query as a string (or string[]), so every
field here either coerces or transforms into the type the controller
actually wants to work with.
*/

export const listProductsQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    category: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
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
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] },
  );

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().default("No detailed description provided."),
  imageUrl: z.string().min(1, "Product image is required"),
  rating: z.coerce.number().min(0).max(5).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;
