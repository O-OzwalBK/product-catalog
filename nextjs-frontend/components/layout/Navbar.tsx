"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, ShoppingCart, User } from "lucide-react";

import SearchBar from "../products/SearchBar";
import { FiltersPopoverTrigger } from "./FiltersPopoverTrigger";
import { useCartCount } from "@/lib/cart-context";
import { Suspense } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { countInCart } = useCartCount();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
            S
          </span>
          ShopCo
        </Link>
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchBar />
        </Suspense>

        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <FiltersPopoverTrigger />
          </Suspense>

          <button
            aria-label="Notifications"
            className="relative text-gray-500 hover:text-gray-900"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-gray-500 hover:text-gray-900"
          >
            <ShoppingCart className="h-5 w-5" />
            {countInCart > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
                {countInCart}
              </span>
            )}
          </Link>

          <Link
            href={session ? "/account" : "/login"}
            aria-label="Account"
            className="text-gray-500 hover:text-gray-900"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
