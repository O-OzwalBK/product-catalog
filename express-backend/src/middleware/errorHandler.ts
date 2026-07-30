import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

/**
 * the single place HTTP status codes and error JSON shape get decided.
 * Controllers just `AppError(...)` or let an unexpected error bubble up
 * this catches everything Express passes to next(err)
 * or that our asyncHandler wrapper forwards.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    let message: unknown = err.message;
    try {
      message = JSON.parse(err.message);
    } catch {}
    return res.status(err.statusCode).json({
      error: { code: err.code, message },
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
}

/**
 * Express 4 doesn't await async route handlers,
 * so a rejected promise inside one is silently swallowed instead of reaching errorHandler.
 * Wrapping every handler with this fixes that with no extra try/catch.
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
