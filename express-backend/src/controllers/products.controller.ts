import { Request, Response } from "express";
import {
  and,
  or,
  ilike,
  gte,
  lte,
  inArray,
  asc,
  desc,
  sql,
  eq,
} from "drizzle-orm";
import { db } from "../db";
import { products } from "../db/schema";
import { AppError } from "../utils/AppError";
import type { ListProductsQuery } from "@catalog/shared";

export async function listProducts(req: Request, res: Response) {
  const { search, category, minPrice, maxPrice, sort, page, limit } =
    req.validatedQuery as unknown as ListProductsQuery;

  // Build up the WHERE clause piece by piece, only including filters that
  // were actually provided. `and(...conditions)` with an empty array just
  // means "no filter", which is what we want when nobody searched/filtered.
  const conditions = [];

  if (search) {
    // Debounced search on the frontend just means fewer requests hit this —
    // the backend still needs to search both name AND description.
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.shortDescription, `%${search}%`),
      ),
    );
  }

  if (category && category.length > 0) {
    conditions.push(inArray(products.category, category));
  }

  if (minPrice !== undefined) {
    conditions.push(gte(products.price, String(minPrice)));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, String(maxPrice)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByClause =
    sort === "price_asc"
      ? [asc(products.price)]
      : sort === "price_desc"
        ? [desc(products.price)]
        : sort === "rating_desc"
          ? [desc(products.rating)]
          : [desc(products.createdAt)]; // sensible default: newest first

  const offset = (page - 1) * limit;

  // Run the page query and the total count in parallel — count needs the
  // same filters (so pagination math is right) but none of the sort/limit.
  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause),
  ]);

  const total = totalRow[0]?.count ?? 0;

  res.status(200).json({
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getProductBySlug(req: Request, res: Response) {
  const slug = req.params.slug as string;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `No product found with slug "${slug}"`,
    );
  }

  res.status(200).json({ data: product });
}
