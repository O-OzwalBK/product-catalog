"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    setStatus({ loading: true, error: null });
    const result = await signIn("credentials", {
      ...formData,
      redirect: false,
    });

    if (result?.error)
      setStatus({ loading: false, error: "Invalid email or password." });
    else {
      setStatus({ loading: false, error: null });
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center items-center bg-[#fafafa]">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        {/* <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
        🛍️
      </div> */}
        <h1 className="text-2xl text-black font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>

        {status.error && (
          <p className="mt-4 text-sm text-red-600">{status.error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full border-b border-gray-300 pb-2 text-sm text-[#171717] placeholder:text-gray-500 outline-none focus:border-gray-900"
            />
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
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border-b border-gray-300 pb-2 text-sm text-[#171717] outline-none focus:border-gray-900"
            />

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
            className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status.loading ? "Signing in..." : "Sign In"}
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
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-gray-900 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
