"use client";
import { SessionProvider } from "next-auth/react";
import { CartCountProvider } from "@/lib/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartCountProvider>{children}</CartCountProvider>
    </SessionProvider>
  );
}
