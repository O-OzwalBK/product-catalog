import jwt from "jsonwebtoken";

const SECRET = process.env.EMAIL_VERIFICATION_SECRET as string;
if (!SECRET) {
  throw new Error(
    "EMAIL_VERIFICATION_SECRET is not set — copy .env.example to .env and fill it in",
  );
}

export interface EmailVerificationPayload {
  email: string;
  purpose: "email_verification";
}

export function signEmailVerificationToken(email: string): string {
  const payload: EmailVerificationPayload = {
    email,
    purpose: "email_verification",
  };
  return jwt.sign(payload, SECRET, { expiresIn: "15m" });
}

export function verifyEmailVerificationToken(
  token: string,
): EmailVerificationPayload {
  return jwt.verify(token, SECRET) as EmailVerificationPayload;
}
