import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { cartItems, products } from "../db/schema";
import { AppError } from "../utils/AppError";

/** Small helper: every cart route scopes by (userId, productId) — this
 * builds that WHERE clause once instead of repeating it in four places. */
function ownedItem(userId: string, productId: number) {
  return and(eq(cartItems.userId, userId), eq(cartItems.productId, productId));
}

export async function getCart(req: Request, res: Response) {
  const userId = req.user!.userId;

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: { product: true },
    orderBy: (cartItems, { desc }) => [desc(cartItems.createdAt)],
  });

  const data = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: item.product,
    lineTotal: Number(item.product.price) * item.quantity,
  }));

  const total = data.reduce((sum, item) => sum + item.lineTotal, 0);

  res.status(200).json({ data, total });
}

export async function addToCart(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { productId, quantity } = req.body;

  const product = await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });

  if (!product) {
    throw new AppError(404, "PRODUCT_NOT_FOUND", "This product does not exist");
  }

  const existing = await db.query.cartItems.findFirst({
    where: ownedItem(userId, productId),
  });

  const desiredQuantity = (existing?.quantity ?? 0) + quantity;

  if (desiredQuantity > product.stock) {
    throw new AppError(
      409,
      "INSUFFICIENT_STOCK",
      `Only ${product.stock} left in stock`,
    );
  }

  const [item] = existing
    ? await db
        .update(cartItems)
        .set({ quantity: desiredQuantity, updatedAt: new Date() })
        .where(ownedItem(userId, productId))
        .returning()
    : await db
        .insert(cartItems)
        .values({ userId, productId, quantity })
        .returning();

  res.status(existing ? 200 : 201).json({ data: item });
}

export async function updateCartItem(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { productId } = req.params as unknown as { productId: number };
  const { quantity } = req.body;

  const existing = await db.query.cartItems.findFirst({
    where: ownedItem(userId, productId),
    with: { product: true },
  });

  if (!existing) {
    throw new AppError(
      404,
      "CART_ITEM_NOT_FOUND",
      "This item is not in your cart",
    );
  }

  if (quantity > existing.product.stock) {
    throw new AppError(
      409,
      "INSUFFICIENT_STOCK",
      `Only ${existing.product.stock} left in stock`,
    );
  }

  const [item] = await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(ownedItem(userId, productId))
    .returning();

  res.status(200).json({ data: item });
}

export async function removeCartItem(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { productId } = req.params as unknown as { productId: number };

  const deleted = await db
    .delete(cartItems)
    .where(ownedItem(userId, productId))
    .returning({ id: cartItems.id });

  if (deleted.length === 0) {
    throw new AppError(
      404,
      "CART_ITEM_NOT_FOUND",
      "This item is not in your cart",
    );
  }

  res.status(204).send();
}
