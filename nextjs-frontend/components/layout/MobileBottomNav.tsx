"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2x2, Search, ShoppingCart, User } from "lucide-react";
import { useCartCount } from "@/lib/cart-context";

const TABS = [
  { href: "/", label: "Browse", icon: Grid2x2 },
  { href: "/", label: "Search", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { countInCart } = useCartCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white md:hidden">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {TABS.map(({ href, label, icon: Icon }, i) => {
          const active = pathname === href && i !== 1;
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <span className="relative">
                <Icon
                  className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-400"}`}
                />
                {label === "Cart" && countInCart > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
                    {countInCart}
                  </span>
                )}
              </span>
              <span
                className={`text-xs ${active ? "font-medium text-gray-900" : "text-gray-400"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
