import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function requireRole(role: "user" | "merchant") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have permission to access this resource",
      );
    }
    next();
  };
}
