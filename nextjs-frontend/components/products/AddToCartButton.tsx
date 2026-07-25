"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addToCart } from "@/lib/api";
import { useCartCount } from "@/lib/cart-context";

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: number;
  stock: number;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { refresh } = useCartCount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await addToCart(session.backendToken!, productId, 1);
      refresh();
      setMessage("Added to cart.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleClick}
        disabled={loading || stock === 0}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {stock === 0 ? "Out of stock" : loading ? "Adding..." : "Add to Cart"}
      </button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
