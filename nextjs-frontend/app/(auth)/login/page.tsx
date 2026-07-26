"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { loginSchema } from "@catalog/shared";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({
    loading: false,
    error: null,
  });

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const { fieldErrors: errors } = z.flattenError(result.error);
      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      });
      return;
    }
    setFieldErrors({});

    setStatus({ loading: true, error: null });
    const response = await signIn("credentials", {
      ...result.data,
      redirect: false,
    });

    if (response?.error)
      setStatus({ loading: false, error: "Invalid email or password." });
    else {
      setStatus({ loading: false, error: null });
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
      <h1 className="text-xl sm:text-2xl text-black font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>

      {status.error && (
        <p className="mt-4 text-sm text-red-600">{status.error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[#171717]"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className={`w-full p-2 border rounded-md text-sm text-black outline-none shadow-xs focus:border-gray-500 placeholder:text-gray-500 ${fieldErrors.email ? "border-red-400" : "border-gray-300"}`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-[#171717]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md text-sm text-black outline-none shadow-xs focus:border-gray-500 placeholder:text-gray-500 ${fieldErrors.password ? "border-red-400" : "border-gray-300"}`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
          )}

          <div className="mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={status.loading}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {status.loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" /> or{" "}
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button className="flex w-full items-center justify-center gap-2 bg-gray-50 rounded-lg shadow-md py-3 text-black text-xs font-semibold hover:bg-gray-100 transition-colors">
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
