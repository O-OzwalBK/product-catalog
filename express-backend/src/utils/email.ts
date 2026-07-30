import nodemailer from "nodemailer";
import type { OtpPurpose } from "@catalog/shared";

const SMTP_HOST = process.env.SMTP_HOST as string;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER as string;
const SMTP_PASS = process.env.SMTP_PASS as string;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  throw new Error(
    "SMTP_HOST, SMTP_USER, and SMTP_PASS must be set — copy .env.example to .env and fill them in",
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const PURPOSE_COPY: Record<OtpPurpose, { subject: string; heading: string }> = {
  password_reset: {
    subject: "Reset your ShopCo password",
    heading: "Reset your password",
  },
  login_2fa: {
    subject: "Your ShopCo sign-in code",
    heading: "Sign-in verification code",
  },
  email_change: {
    subject: "Confirm your new email",
    heading: "Confirm your new email address",
  },
  email_verification: {
    subject: "Verify your email for ShopCo",
    heading: "Verify your email address",
  },
};

export async function sendOtpEmail(
  email: string,
  code: string,
  purpose: OtpPurpose,
): Promise<void> {
  const copy = PURPOSE_COPY[purpose];

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject: copy.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111827;">${copy.heading}</h2>
        <p style="color: #374151;">Use the code below. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; margin: 24px 0;">
          ${code}
        </p>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}
