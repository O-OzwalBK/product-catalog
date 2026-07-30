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

  const conditions = [];

  if (search) {
    /*
    debounced search on the frontend just means fewer requests hit this —
    the backend still needs to search both name and description.
    */
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
          : [desc(products.createdAt)];

  const offset = (page - 1) * limit;

  //  run the page query and the total count in parallel
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
export async function createProduct(req: Request, res: Response) {
  const {
    name,
    category,
    price,
    stock,
    shortDescription,
    longDescription,
    imageUrl,
    rating,
  } = req.body;

  let slug = req.body.slug;
  if (!slug) {
    slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  // ensure unique slug collision resolution
  const existingSlug = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const [product] = await db
    .insert(products)
    .values({
      name,
      slug,
      category,
      price: String(price),
      stock: Number(stock),
      shortDescription,
      longDescription: longDescription || "No detailed description provided.",
      imageUrl,
      rating: rating !== undefined ? String(rating) : "0",
    })
    .returning();

  res.status(201).json({ data: product });
}

export async function updateProduct(req: Request, res: Response) {
  const productId = Number(req.params.productId);
  const {
    name,
    slug,
    category,
    price,
    stock,
    shortDescription,
    longDescription,
    imageUrl,
    rating,
  } = req.body;

  const existing = await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });

  if (!existing) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `No product found with ID ${productId}`,
    );
  }

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (category !== undefined) updateData.category = category;
  if (price !== undefined) updateData.price = String(price);
  if (stock !== undefined) updateData.stock = Number(stock);
  if (shortDescription !== undefined)
    updateData.shortDescription = shortDescription;
  if (longDescription !== undefined)
    updateData.longDescription = longDescription;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (rating !== undefined) updateData.rating = String(rating);

  const [updated] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.productId, productId))
    .returning();

  res.status(200).json({ data: updated });
}

export async function deleteProduct(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  const deleted = await db
    .delete(products)
    .where(eq(products.productId, productId))
    .returning({ productId: products.productId });

  if (deleted.length === 0) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `No product found with ID ${productId}`,
    );
  }

  res.status(204).send();
}
