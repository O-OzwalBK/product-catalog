"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { OtpInput } from "@/components/auth/OtpInput";
import useCountdown from "@/hooks/useCountdown";
import { requestOtp, verifyOtp } from "@/lib/api";
import type { OtpPurpose } from "@/lib/types";

const RESEND_SECONDS = 60;
const emailSchema = z.email("Enter a valid email address");

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpose =
    (searchParams.get("purpose") as OtpPurpose) || "email_verification";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { secondsLeft, start } = useCountdown(RESEND_SECONDS);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Enter a valid email address",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestOtp(email, purpose);
      setStep("otp");
      start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return;
    setError(null);
    setCode("");
    try {
      await requestOtp(email, purpose);
      start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyOtp(email, purpose, code);

      if (purpose === "email_verification" && result.verificationToken) {
        sessionStorage.setItem(
          "emailVerification",
          JSON.stringify({
            email,
            verificationToken: result.verificationToken,
          }),
        );
        router.push("/register");
        return;
      }

      // password_reset / login_2fa land here once those flows exist — each
      // will redirect somewhere purpose-specific instead of "/".
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
      {step === "email" ? (
        <>
          <h1 className="text-xl sm:text-2xl text-black font-bold">
            Verify your email
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            We'll send a 6-digit code to confirm it's you.
          </p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSendCode} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[#171717]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2 border rounded-md text-sm text-black outline-none shadow-xs focus:border-gray-500 placeholder:text-gray-500 border-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-xl sm:text-2xl text-black font-bold">
            Enter your code
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sent to <span className="font-medium text-gray-900">{email}</span>.{" "}
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="text-gray-700 underline"
            >
              Change email
            </button>
          </p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <form onSubmit={handleVerify} className="mt-6 space-y-5" noValidate>
            <OtpInput
              value={code}
              onChange={setCode}
              error={!!error}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="mt-4 text-sm font-medium text-gray-700 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
          </button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-gray-400">Loading...</div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
