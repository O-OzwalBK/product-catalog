"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  ShoppingCart,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";

import SearchBar from "../products/SearchBar";
import { FiltersPopoverTrigger } from "./FiltersPopoverTrigger";
import { useCartCount } from "@/lib/cart-context";
import { getCart, updateCartItem, removeCartItem } from "@/lib/api";
import type { CartLine } from "@catalog/shared";

import Cart from "../products/Cart";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
 const {
   countInCart,
   setCountInCart,
   refresh,
   isCartOpen,
   openCart,
   closeCart,
 } = useCartCount();

  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cart Data State
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = session?.backendToken;

  // 1. Fetch Cart contents whenever the drawer is opened or item count changes
useEffect(() => {
  if (isCartOpen && token) {
    getCart(token)
      .then((res) => {
        setCartItems(res.data);
        setCartTotal(res.total);
        // Compute total items count across line items
        const totalItems = res.data.reduce(
          (sum: number, item: CartLine) => sum + item.quantity,
          0,
        );
        setCountInCart(totalItems);
      })
      .catch(() => {
        setCartItems([]);
        setCartTotal(0);
        setCountInCart(0);
      });
  }
}, [isCartOpen, token, setCountInCart]);

  // 2. Handle User Dropdown click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Cart Action Handlers
  const handleUpdateQuantity = async (
    productId: number,
    newQuantity: number,
  ) => {
    if (!token) return;
    try {
      await updateCartItem(token, productId, newQuantity);

      // Optimistically update local cart drawer state
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId) {
            const price = Number(item.product.price);
            return {
              ...item,
              quantity: newQuantity,
              lineTotal: price * newQuantity,
            };
          }
          return item;
        }),
      );

      refresh();
    } catch (error) {
      console.error("Failed to update cart quantity", error);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!token) return;
    try {
      await removeCartItem(token, productId);

      // Filter out item locally
      setCartItems((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
      refresh();
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className="shadow-2xs bg-white">
        {/* Container: Flex Wrap on Mobile -> 3-Col Grid on Desktop */}
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 max-w-6xl md:grid md:grid-cols-3 md:gap-4 md:py-4">
          {/* Column 1 / Top Left on Mobile: Logo */}
          <div className="order-1 flex items-center justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-xs text-white">
                S
              </span>
              ShopCo
            </Link>
          </div>

          {/* Column 2 / Row 2 on Mobile: Centered Search Bar */}
          <div className="order-3 w-full flex items-center justify-center md:order-2 md:w-auto">
            <Suspense
              fallback={
                <div className="w-full text-center text-xs text-gray-400 py-1">
                  Loading search...
                </div>
              }
            >
              <SearchBar />
            </Suspense>
          </div>

          {/* Column 3 / Top Right on Mobile: Actions */}
          <div className="order-2 flex items-center justify-end gap-3 sm:gap-4 md:order-3">
            <Suspense fallback={<div>Loading filters...</div>}>
              <FiltersPopoverTrigger />
            </Suspense>

            {/* Notifications Button */}
            <button
              aria-label="Notifications"
              className="relative text-gray-500 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Desktop Shopping Cart Trigger Button (Hidden on Mobile) */}
            <button
              onClick={() => {
                if (!session) {
                  router.push("/login");
                } else {
                  openCart();
                }
              }}
              aria-label="Open Cart"
              className="hidden md:flex relative text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <ShoppingCart className="h-5 w-5" />
              {countInCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white font-medium">
                  {countInCart}
                </span>
              )}
            </button>

            {/* User Account & Dropdown */}
            {!session ? (
              <Link
                href="/login"
                aria-label="Sign In"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900 focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-800 border">
                    {session.user?.name?.[0]?.toUpperCase() || (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </p>
                      <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 uppercase">
                        {session.user?.role || "user"}
                      </span>
                    </div>

                    {/* Merchant Admin Link */}
                    {session.user?.role === "merchant" && (
                      <Link
                        href="/admin/products"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                        Dashboard
                      </Link>
                    )}

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Cart Drawer Integration */}
      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cartItems}
        totalAmount={cartTotal}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </>
  );
}
