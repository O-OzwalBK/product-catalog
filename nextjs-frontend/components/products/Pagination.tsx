"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Pagination as PaginationType } from "@/lib/types";

export function Pagination({ pagination }: { pagination: PaginationType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="rounded border px-3 py-1.5 disabled:opacity-40"
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="rounded border px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
