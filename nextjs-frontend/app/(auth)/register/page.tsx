"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { registerFormSchema } from "@catalog/shared";
import InputField from "@/components/ui/InputField";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  function handleInputChange(field: keyof FormData) {
    return (value: string) => {
      setFormData((currentData) => ({
        ...currentData,
        [field]: value,
      }));
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = registerFormSchema.safeParse(formData);
    if (!result.success) {
      const { fieldErrors: errors } = z.flattenError(result.error);
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        confirmPassword: errors.confirmPassword?.[0],
        agreedToTerms: errors.agreedToTerms?.[0],
      });
      return;
    }
    setFieldErrors({});
    setStatus({ loading: true, error: null });

    try {
      const { name, email, password } = result.data;

      await registerUser({ name, email, password });

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (response?.error)
        throw new Error(
          "Registered, but sign-in failed — try logging in manually.",
        );
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Something went wrong.",
      });
      return;
    }
    setStatus({ loading: false, error: null });
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
        👤
      </div>
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl text-black font-bold">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Join ShopCo and start shopping
        </p>
      </div>

      {status.error && (
        <p className="mt-3 text-sm text-red-600">{status.error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
        <InputField
          label="Full name"
          id="name"
          value={formData.name}
          onChange={handleInputChange("name")}
          placeholder="Jane Doe"
          error={fieldErrors.name}
        />
        <InputField
          label="Email address"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange("email")}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <InputField
          label="Password"
          id="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange("password")}
          showPasswordToggle
          error={fieldErrors.password}
        />

        <InputField
          label="Confirm password"
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          showPasswordToggle
          error={fieldErrors.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) =>
                setFormData((d) => ({ ...d, agreedToTerms: e.target.checked }))
              }
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
          {fieldErrors.agreedToTerms && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.agreedToTerms}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {status.loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" /> or{" "}
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button className="flex w-full items-center justify-center gap-2 bg-gray-50 rounded-lg shadow-md py-2.5 text-black text-xs font-semibold hover:bg-gray-100 transition-colors">
        Continue with Google
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
