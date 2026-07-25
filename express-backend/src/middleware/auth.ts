import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { AppError } from "../utils/AppError";

// Augment Express's Request type so `req.user` is typed everywhere
// downstream, instead of casting `req as any` in every controller.
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Protects a route: requires "Authorization: Bearer <token>", verifies it,
 * and attaches the decoded { userId, email } to req.user. Only authenticated
 * users can reach the cart routes — this is where that rule is enforced.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
  }
}
