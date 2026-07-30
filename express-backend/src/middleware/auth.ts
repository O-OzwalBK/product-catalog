import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Missing or malformed Authorization header",
      );
    }
    const token = header.slice("Bearer ".length);
    const decodedPayload = verifyToken(token);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedPayload.userId))
      .limit(1);
    if (!existingUser) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Session invalid. User does not exist.",
      );
    }

    req.user = decodedPayload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
    }
  }
}
