import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — copy .env.example to .env and fill it in");
}

// A connection pool (not a single client) so concurrent requests each get
// their own connection instead of queueing behind one another.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// `schema` is passed in so `db.query.products.findMany({ with: {...} })`
// style relational queries are available, on top of the SQL query builder.
export const db = drizzle(pool, { schema });
