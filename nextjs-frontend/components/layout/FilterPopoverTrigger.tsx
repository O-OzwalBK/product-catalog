"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

export function FiltersPopoverTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(searchParams.get("minPrice") ?? "");
  const [max, setMax] = useState(searchParams.get("maxPrice") ?? "");

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Filters"
        className="text-gray-500 hover:text-gray-900"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border bg-white p-4 shadow-lg">
          <p className="mb-3 text-sm font-semibold">Price range</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={apply}
            className="mt-3 w-full rounded-lg bg-gray-900 py-2 text-sm text-white"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
