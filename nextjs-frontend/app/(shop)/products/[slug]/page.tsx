import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Heart } from "lucide-react";
import { getProductBySlug } from "@/lib/api";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let product: Product;
  try {
    ({ data: product } = await getProductBySlug(slug));
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          aria-label="Add to wishlist"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        >
          <Heart className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* The mock shows 3 gallery thumbnails — your schema stores one imageUrl per product,
          so this repeats it 3x as a placeholder. A real gallery needs a productImages table. */}
      <div className="mt-3 flex gap-2">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-gray-900"
          >
            <Image
              src={product.imageUrl}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-500">{product.category}</p>
      <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="text-amber-500">★</span>{" "}
          {Number(product.rating).toFixed(1)}
        </div>
        <span className="text-2xl font-bold">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>

      <p className="mt-4 text-gray-700">{product.longDescription}</p>

      {/* Visual only — no variant/color column in the products table. Clicking these
          doesn't change what gets added to the cart until you add a real variants table. */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold">Color</h3>
        <div className="flex gap-2">
          {["#111827", "#f3f4f6", "#6b7280"].map((color, i) => (
            <button
              key={color}
              aria-label={`Color option ${i + 1}`}
              className={`h-8 w-8 rounded-full border-2 ${i === 0 ? "border-gray-900" : "border-transparent"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span
          className={`h-2 w-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
        />
        {product.stock > 0
          ? `In Stock (${product.stock} available)`
          : "Out of stock"}
      </div>

      <AddToCartButton productId={product.id} stock={product.stock} />
    </div>
  );
}
