"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Grid2x2, Search, ShoppingCart, User } from "lucide-react";
import { useCartCount } from "@/lib/cart-context";
import { Suspense } from "react";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { countInCart, isCartOpen, openCart } = useCartCount();

  const hasSearch = Boolean(searchParams.get("search"));

  const handleCartClick = () => {
    if (!session) {
      router.push("/login");
    } else {
      openCart();
    }
  };

  const TABS = [
    {
      id: "browse",
      label: "Browse",
      icon: Grid2x2,
      active: pathname === "/" && !hasSearch,
      onClick: undefined,
      href: "/",
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      active: pathname === "/" && hasSearch,
      onClick: undefined,
      href: "/",
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      active: isCartOpen,
      onClick: handleCartClick,
      href: undefined,
    },
    {
      id: "account",
      label: "Account",
      icon: User,
      active: pathname === "/account",
      onClick: undefined,
      href: "/account",
    },
  ];

  return (
    <div className="mx-auto flex max-w-md justify-around py-2">
      {TABS.map(({ id, href, label, icon: Icon, active, onClick }) => {
        const content = (
          <>
            <span className="relative">
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-gray-900" : "text-gray-400"
                }`}
              />
              {label === "Cart" && countInCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white font-medium">
                  {countInCart}
                </span>
              )}
            </span>
            <span
              className={`text-xs ${
                active ? "font-medium text-gray-900" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </>
        );

        if (onClick) {
          return (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="flex flex-col items-center gap-1 px-4 py-1 focus:outline-none"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={id}
            href={href!}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white md:hidden">
      <Suspense fallback={null}>
        <BottomNavContent />
      </Suspense>
    </nav>
  );
}
