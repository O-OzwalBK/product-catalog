import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">
        No products match your filters.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((product,index) => (
        <ProductCard key={product.id} product={product} preload={ index<4} />
      ))}
    </div>
  );
}
