"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreed, setAgreed] = useState(false);

  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  function handleInputChange(field: keyof typeof formData) {
    return (value: string) => {
      setFormData((currentData) => ({
        ...currentData,
        [field]: value,
      }));
    };
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword)
      return setStatus((previousStatus) => ({
        ...previousStatus,
        error: "Passwords don't match.",
      }));
    if (!agreed)
      return setStatus((previousStatus) => ({
        ...previousStatus,
        error: "Please agree to the Terms of Service and Privacy Policy.",
      }));

    setStatus({ loading: true, error: null });

    try {
      const response = await signIn("credentials", {
        ...formData,
        redirect: false,
      });
      if (response?.error)
        throw new Error(
          "Registered, but login failed — try logging in manually.",
        );
      router.push("/");
      router.refresh();
    } catch (error) {
    } finally {
      setStatus({ loading: false, error: null });
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center items-center bg-[#fafafa]">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
          👤
        </div>
        <div className="text-center">
          <h1 className="text-2xl text-black font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join ShopCo and start shopping
          </p>
        </div>

        {status.error && (
          <p className="mt-4 text-sm text-red-600">{status.error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label="Full name"
            id="fullName"
            value={formData.fullName}
            onChange={handleInputChange("fullName")}
            placeholder="Jane Doe"
          />
          <InputField
            label="Email address"
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="you@example.com"
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleInputChange("password")}
            showPasswordToggle
          />

          <InputField
            label="Confirm password"
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            showPasswordToggle
          />

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            I agree to the{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </label>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status.loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" /> or{" "}
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button className="flex w-full items-center justify-center gap-2 bg-gray-50 rounded-lg shadow-md py-3 text-black text-xs font-semibold hover:bg-gray-100">
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-gray-900 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
