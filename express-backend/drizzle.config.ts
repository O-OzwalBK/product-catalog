import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_DB_URL
    : process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Database URL is not set look inside the .env file");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});
