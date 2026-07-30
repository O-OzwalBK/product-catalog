import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { otpCodes } from "../db/schema";
import { AppError } from "../utils/AppError";
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  otpExpiryDate,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "../utils/otp";
import { sendOtpEmail } from "../utils/email";
import { signEmailVerificationToken } from "../utils/emailVerificationToken";
import type { RequestOtpInput, VerifyOtpInput } from "@catalog/shared";

export async function requestOtp(req: Request, res: Response) {
  const { email, purpose } = req.body as RequestOtpInput;

  const existing = await db.query.otpCodes.findFirst({
    where: and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)),
  });

  // Cooldown against spam-clicking "resend" — only matters while a code is
  // still live; a consumed one shouldn't block a fresh request.
  if (existing && !existing.consumedAt) {
    const secondsSince = (Date.now() - existing.createdAt.getTime()) / 1000;
    if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince);
      throw new AppError(
        429,
        "OTP_COOLDOWN",
        `Please wait ${wait}s before requesting another code`,
      );
    }
  }

  const code = generateOtp();
  const otpHash = hashOtp(code, email, purpose);
  const expiresAt = otpExpiryDate();

  // Same upsert trick as seed.ts's onConflictDoUpdate against products.slug —
  // here the conflict target is the composite (email, purpose) unique
  // constraint instead of a single column.
  await db
    .insert(otpCodes)
    .values({
      email,
      purpose,
      otpHash,
      expiresAt,
      attempts: 0,
      consumedAt: null,
    })
    .onConflictDoUpdate({
      target: [otpCodes.email, otpCodes.purpose],
      set: {
        otpHash,
        expiresAt,
        attempts: 0,
        consumedAt: null,
        createdAt: new Date(),
      },
    });

  try {
    await sendOtpEmail(email, code, purpose);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    throw new AppError(
      502,
      "EMAIL_SEND_FAILED",
      "Could not send verification email. Please try again.",
    );
  }
  res.status(200).json({ message: "Verification code sent" });
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, purpose, code } = req.body as VerifyOtpInput;

  const existing = await db.query.otpCodes.findFirst({
    where: and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)),
  });

  if (!existing) {
    throw new AppError(
      400,
      "OTP_NOT_FOUND",
      "No pending code for this email. Request a new one.",
    );
  }
  if (existing.consumedAt) {
    throw new AppError(
      400,
      "OTP_ALREADY_USED",
      "This code has already been used. Request a new one.",
    );
  }
  if (existing.expiresAt.getTime() < Date.now()) {
    throw new AppError(
      400,
      "OTP_EXPIRED",
      "This code has expired. Request a new one.",
    );
  }
  if (existing.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(
      429,
      "OTP_LOCKED",
      "Too many incorrect attempts. Request a new code.",
    );
  }

  const isValid = verifyOtpHash(code, email, purpose, existing.otpHash);

  if (!isValid) {
    await db
      .update(otpCodes)
      .set({ attempts: existing.attempts + 1 })
      .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)));
    throw new AppError(400, "OTP_INCORRECT", "Incorrect code");
  }

  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(otpCodes.email, email), eq(otpCodes.purpose, purpose)));

  if (purpose === "email_verification") {
    const verificationToken = signEmailVerificationToken(email);
    return res.status(200).json({ verified: true, verificationToken });
  }

  res.status(200).json({ verified: true });
}
