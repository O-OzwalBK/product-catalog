import crypto from "crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

const HASH_SECRET = process.env.OTP_HASH_SECRET as string;
if (!HASH_SECRET) {
  throw new Error(
    "OTP_HASH_SECRET is not set — copy .env.example to .env and fill it in",
  );
}

export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export function hashOtp(code: string, email: string, purpose: string): string {
  return crypto
    .createHmac("sha256", HASH_SECRET)
    .update(`${email}:${purpose}:${code}`)
    .digest("hex");
}

export function verifyOtpHash(
  code: string,
  email: string,
  purpose: string,
  storedHash: string,
): boolean {
  const candidate = Buffer.from(hashOtp(code, email, purpose), "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}
