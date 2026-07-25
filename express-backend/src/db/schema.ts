import {
  pgTable,
  serial,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * users
 * One row per registered account. We store a bcrypt hash, never a
 * plaintext password. uuid primary keys are used here (instead of serial)
 * because user ids sometimes leak into URLs/tokens and we don't want to
 * reveal how many users exist or let ids be guessed sequentially.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * products
 * The catalog itself. `slug` is unique because the product detail page
 * is reached via /products/[slug] rather than a numeric id — slugs are
 * URL-friendly and stable even if you regenerate the table.
 * `price` and `rating` use `numeric` (not `real`/`float`) so money and
 * ratings don't suffer floating point rounding errors.
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description").notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * cart_items
 * The server-persisted cart. Rather than one JSON blob per user, each
 * (user, product) pair is its own row. This gives us:
 *  - a unique constraint so "add to cart" can safely upsert (increment
 *    quantity) instead of creating duplicate rows
 *  - cheap quantity updates and deletes without rewriting a whole blob
 *  - the ability to join against `products` for live price/stock data
 */
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // A user can only have ONE row per product — "add to cart" again
    // just bumps the quantity on this row instead of inserting a new one.
    userProductUnique: unique("user_product_unique").on(
      table.userId,
      table.productId
    ),
  })
);

// Relations let us write db.query.cartItems.findMany({ with: { product: true } })
// instead of hand-writing joins every time.
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
