import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

type Source = "body" | "query" | "params";

// Express 5 turned req.query into a getter with no backing store — it
// re-parses the raw URL on every access instead of returning a cached
// object, so anything we assign onto req.query is silently thrown away.
// req.body and req.params are still plain writable properties, so only
// "query" needs this workaround; validated query data lives here instead.
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

/**
 * Wraps a zod schema into Express middleware. On success:
 *  - source "body"/"params": req[source] is REPLACED with the parsed value
 *  - source "query": the parsed value is stored on req.validatedQuery
 * Either way, string query params like "minPrice=10" arrive at the
 * controller already coerced to real types (number, array, etc).
 */
export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new AppError(400, "VALIDATION_ERROR", JSON.stringify(details));
    }

    if (source === "query") {
      req.validatedQuery = result.data as Record<string, unknown>;
    } else {
      req[source] = result.data;
    }

    next();
  };
}
