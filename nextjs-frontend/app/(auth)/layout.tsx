"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="px-6 py-4 shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg text-black font-bold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
              S
            </span>
            ShopCo
          </Link>
          <Link
            href={isLogin ? "/verify" : "/login"}
            className="text-sm text-gray-600 hover:underline"
          >
            {isLogin ? "Create account" : "Sign in"}
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
