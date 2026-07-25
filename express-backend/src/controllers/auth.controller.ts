import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { signToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    throw new AppError(
      409,
      "EMAIL_TAKEN",
      "An account with this email already exists",
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email });

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
}
