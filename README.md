## Running locally

### Pre-requisites

- Node.js - `v24.18.0`
- pnpm - `v11.9.0`

**Optional (if database is to be ran locally too):**
PostgreSQL > `v18.4`

### Steps

1. Clone the repo
2. Run `pnpm install` from the root directory
3. Create a `.env` file inside directories `nextjs-frontend` and `express-backend`
4. Copy each of the `.env.example` file inside that directory into its `.env` file
5. Fill up the environment variables with actual value
6. Run `pnpm db:generate` and then `pnpm db:migrate` from the root folder
7. Run `pnpm dev` from the root folder
