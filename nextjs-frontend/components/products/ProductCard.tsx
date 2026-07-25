"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Plus } from "lucide-react";
import { addToCart } from "@/lib/api";
import { useCartCount } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false); // visual only — no wishlist table/endpoint exists

  return (
    <div className="group relative rounded-2xl border bg-white p-3 transition hover:shadow-md">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setWishlisted((v) => !v);
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm"
      >
        <Heart
          className={`h-4 w-4 ${wishlisted ? "fill-gray-900 text-gray-900" : "text-gray-500"}`}
        />
      </button>

      <Link href={`/products/${product.slug}`} className="mt-3 block">
        <p className="text-xs text-gray-500">{product.category}</p>
        <h3 className="mt-0.5 text-sm font-semibold group-hover:underline">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <span className="text-amber-500">★</span>{" "}
          {Number(product.rating).toFixed(1)}
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-bold">
          ${Number(product.price).toFixed(2)}
        </span>
        <AddToCartIconButton productId={product.id} stock={product.stock} />
      </div>
    </div>
  );
}

function AddToCartIconButton({
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

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await addToCart(session.backendToken!, productId, 1);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || stock === 0}
      aria-label="Add to cart"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-40"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
