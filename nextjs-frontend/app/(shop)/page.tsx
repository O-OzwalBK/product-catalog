import { getProducts } from "@/lib/api";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryPills } from "@/components/products/CategoryPills";
import { SortMenu } from "@/components/products/SortMenu";
import { Pagination } from "@/components/products/Pagination";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.sort) query.set("sort", params.sort);
  query.set("page", params.page ?? "1");

  const { data: products, pagination } = await getProducts(query);

  return (
    <div>
      <p className="text-sm text-gray-500">Discover</p>
      <h1 className="text-3xl font-bold">Catalog</h1>
      <div className="mt-4">
        <CategoryPills />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{pagination.total} results</p>
        <SortMenu />
      </div>
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
