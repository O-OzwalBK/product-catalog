# Product Catalog — Backend & Database

This is a working reference implementation of the backend + database half of
the spec: Express + TypeScript, PostgreSQL, Drizzle ORM, JWT auth. Every
endpoint below has been run against a real Postgres database — register,
login, product search/filter/sort, and the full cart lifecycle all verified
end to end.

This README assumes you're comfortable with Express/REST already and
focuses on the parts that are probably new: **Drizzle** and **Postgres**.

---

## 1. The big picture

Three moving pieces talk to each other:

```
HTTP request → Express route → controller → Drizzle → PostgreSQL
                     ↓              ↓
               validate() middleware, requireAuth middleware
```

- **Routes** (`src/routes/*.routes.ts`) — just wire a URL + HTTP verb to a
  controller, with middleware in between.
- **Controllers** (`src/controllers/*.ts`) — the actual logic. Read the
  request, ask the database something, shape the response.
- **Drizzle** (`src/db/schema.ts`, `src/db/index.ts`) — the layer that turns
  TypeScript function calls into SQL and turns SQL result rows back into
  typed objects.
- **Postgres** — the actual database process, completely separate from your
  Node process, listening on port 5432.

Folder layout:

```
src/
  db/
    schema.ts       # table definitions — the source of truth for your DB shape
    index.ts         # the connection Drizzle uses
    seed.ts           # inserts sample products
  middleware/
    auth.ts            # verifies JWT, attaches req.user
    validate.ts          # runs a zod schema against body/query/params
    errorHandler.ts        # turns thrown errors into HTTP responses
  routes/            # URL + method → controller wiring, one file per resource
  controllers/       # the actual request-handling logic
  utils/
    AppError.ts      # a typed "expected error" class
    jwt.ts             # sign/verify helpers
  index.ts           # app entry point — assembles everything above
drizzle/             # auto-generated SQL migration files (don't hand-edit)
drizzle.config.ts     # tells drizzle-kit where your schema and DB are
```

---

## 2. Why Postgres, and how to get one running

You have three realistic options. Pick whichever is least friction for you:

**A. Docker (recommended for local dev)**
```bash
docker run --name product-catalog-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=product_catalog \
  -p 5432:5432 -d postgres:16
```

**B. Install Postgres directly (what I used to test this)**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb product_catalog
```

**C. A free hosted instance (Neon, Supabase, or Railway)** — no local install
at all. You just get a `DATABASE_URL` connection string from their
dashboard. This is genuinely the easiest option and matches how you'll
deploy anyway (the spec wants a public URL). I'd start here.

Whichever you pick, you end up with one thing: a **connection string**,
which is just a URL that packs together host, port, username, password, and
database name:

```
postgresql://<user>:<password>@<host>:<port>/<database>
```

That string is the *only* thing that connects your Node code to Postgres —
copy it into `.env` as `DATABASE_URL` (see `.env.example`).

---

## 3. Drizzle, from the ground up

If your SQL experience is "I can write queries" but you haven't used an
ORM/query-builder before, here's the mental model.

### 3a. The schema is TypeScript, not SQL

`src/db/schema.ts` defines your tables as plain TypeScript objects:

```ts
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  // ...
});
```

This is the **one source of truth** for your database shape. You never
hand-write `CREATE TABLE`. Instead, Drizzle reads this file and generates
the SQL for you (next section). The payoff: `products.price` is now a
TypeScript-typed reference you can pass into query functions, and your
editor will yell at you if you typo a column name — that's not possible
with raw SQL strings.

A couple of column choices worth understanding, since they're easy to get
wrong:

- **`numeric` vs `real`/`float` for price and rating.** Floating point
  can't represent most decimals exactly (`0.1 + 0.2 !== 0.3` in every
  language). For money, that's a bug waiting to happen. `numeric(10, 2)`
  stores prices as exact decimals. The trade-off: Drizzle returns numeric
  columns as **strings**, not numbers (e.g. `"44.99"`), because JS numbers
  have the same precision problem — that's why you'll see
  `Number(item.product.price)` in the cart controller whenever we need to
  do arithmetic.
- **`uuid` for users, `serial` (auto-incrementing int) for products.** User
  IDs sometimes end up in URLs or tokens; a sequential integer would let
  anyone guess `user 1, 2, 3...` and estimate your user count. Product IDs
  have no such sensitivity, and small integers are easier to read/debug
  and cheaper to index and join on — so plain serial ints there.

### 3b. Migrations: schema.ts → real SQL → real database

Drizzle-kit is a CLI that diffs your schema file against the database and
generates the SQL to reconcile them. Three commands matter:

```bash
npm run db:generate   # reads schema.ts, writes a .sql file into drizzle/
npm run db:migrate    # runs any not-yet-applied .sql files against DATABASE_URL
npm run db:seed       # inserts the 15 sample products
```

The generated file (`drizzle/0000_youthful_sandman.sql`) is plain,
readable SQL — open it and you'll see the `CREATE TABLE` statements you'd
have written by hand, plus foreign keys and the unique constraint on cart
items. **Commit these files to git.** They're your schema's changelog: if
you later add a column, you run `db:generate` again, get a
`0001_....sql` with just an `ALTER TABLE`, and `db:migrate` applies only
the new one. This is what lets a teammate (or your deployed server) go
from an empty database to the current schema by just running
`db:migrate`.

There's a fourth command, `drizzle-kit push`, that skips generating a file
and pushes schema changes straight to the database. It's convenient for
solo prototyping but leaves no history — for anything you're going to
deploy or hand off, `generate` + `migrate` is the right habit.

### 3c. Two ways to query, and when to use each

Drizzle gives you two APIs. This project uses both, deliberately:

**The SQL-like builder** — mirrors SQL almost 1:1, and is what you want for
anything with filtering/sorting logic, like the product listing:

```ts
db.select().from(products).where(eq(products.slug, slug))
```

**The relational query API** — better for fetching an entity *with its
related rows* in one call, like the cart (each cart row + its product):

```ts
db.query.cartItems.findMany({
  where: eq(cartItems.userId, userId),
  with: { product: true },   // <- this is the part the SQL builder can't do this simply
})
```

That `with: { product: true }` only works because of the `relations(...)`
calls at the bottom of `schema.ts`, which tell Drizzle how tables connect
without you writing the join by hand.

### 3d. The upsert pattern (why cart "add" doesn't create duplicates)

Look at `addToCart` in `cart.controller.ts`. Adding a product that's
already in your cart doesn't insert a second row — it increases the
existing row's quantity. That's enforced at the database level: the
`cart_items` table has

```ts
unique("user_product_unique").on(table.userId, table.productId)
```

so the database itself refuses to have two rows for the same
(user, product) pair. The controller checks whether a row already exists
first and updates vs. inserts accordingly — that's a manual
read-then-write version of what SQL calls `INSERT ... ON CONFLICT`. (You'll
also see `onConflictDoUpdate` used in `seed.ts`, which is that same idea
but in one atomic query — worth comparing the two once the manual version
makes sense.)

---

## 4. Auth, validation, and errors — the cross-cutting pieces

**Auth** is a standard JWT credentials flow: `POST /api/auth/register`
hashes the password with bcrypt and returns a signed token; every
protected route requires `Authorization: Bearer <token>`, checked by
`requireAuth` middleware, which decodes the token and attaches
`req.user = { userId, email }`. No sessions, no cookies — simple, and
enough for the "simple credentials provider" option the spec allows.

**Validation** uses zod schemas + a small `validate()` middleware
(`src/middleware/validate.ts`) that runs a schema against
`req.body`/`req.query`/`req.params` and rejects with `400` before your
controller ever sees bad data. This is also where query strings get
**coerced**: `?minPrice=10` arrives as the string `"10"` over HTTP, and
the schema turns it into the number `10` before the controller runs.

> **A genuine gotcha I hit building this, worth knowing:** in Express 5,
> `req.query` is a read-only getter that re-parses the URL on every access
> — you cannot do `req.query = validatedData` (it throws, and worse, a
> silent version of that mistake just gets ignored). This project stores
> validated query data on `req.validatedQuery` instead. If you've used
> Express 4 before, this is a real behavior change to know about.

**Errors** funnel through one place: controllers throw `new AppError(status,
code, message)` for anything expected (not found, bad credentials, out of
stock), and `errorHandler` middleware (registered last in `src/index.ts`)
turns that into a consistent JSON shape:

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }
```

Anything that ISN'T an `AppError` — a real bug, a dropped DB connection —
falls through to a generic `500`, so you never accidentally leak a stack
trace to a client.

---

## 5. Running it yourself

```bash
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET
npm install
npm run db:migrate          # create the tables
npm run db:seed             # insert 15 sample products
npm run dev                 # starts on http://localhost:4000
```

Quick smoke test:

```bash
curl http://localhost:4000/health

curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"You","email":"you@example.com","password":"password123"}'
# copy the returned token into $TOKEN below

curl "http://localhost:4000/api/products?category=Home&sort=price_asc"

curl -X POST http://localhost:4000/api/cart \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":8,"quantity":2}'

curl http://localhost:4000/api/cart -H "Authorization: Bearer $TOKEN"
```

## 6. Endpoint reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/products` | no | `search`, `category` (comma-separated), `minPrice`, `maxPrice`, `sort` (`price_asc`/`price_desc`/`rating_desc`), `page`, `limit` |
| GET | `/api/products/:slug` | no | 404 if not found |
| POST | `/api/auth/register` | no | `{name, email, password}` → 201 |
| POST | `/api/auth/login` | no | `{email, password}` → 200 |
| GET | `/api/cart` | yes | items with joined product + line/cart totals |
| POST | `/api/cart` | yes | `{productId, quantity}` — adds or merges |
| PATCH | `/api/cart/:productId` | yes | `{quantity}` — sets exact quantity |
| DELETE | `/api/cart/:productId` | yes | 204, or 404 if not in cart |

## 7. Deploying

Railway or Render both work well for "Node app + Postgres" and match what
the spec asks for:

1. Create a Postgres instance on the platform (or keep using Neon/Supabase).
2. Deploy this repo as a web service; set the same env vars from
   `.env.example` in the platform's dashboard (a real random `JWT_SECRET`,
   not the dev one).
3. Run `npm run db:migrate` once against the production `DATABASE_URL`
   (most platforms let you run a one-off command, or you can add it as a
   release/build step) — then `npm run db:seed` if you want the sample
   catalog live.
4. `npm run build && npm run start`.

## 8. What's deliberately not in here

This is backend + database only, per your request — no Next.js frontend,
no Figma-matching UI. When you build the frontend, it talks to this API
over HTTP using `CORS_ORIGIN` (already wired up in `src/index.ts`) — point
it at `http://localhost:4000` (or wherever this deploys) and set
`CORS_ORIGIN` to your frontend's URL.
