"use client";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const OPTIONS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low" },
  { value: "price_desc", label: "Price: High" },
  { value: "rating_desc", label: "Rating: High" },
];

export function SortMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current =
    OPTIONS.find((o) => o.value === (searchParams.get("sort") ?? "")) ??
    OPTIONS[0];

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <ArrowUpDown className="h-4 w-4" /> {current.label}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border bg-white py-1 shadow-lg">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${o.value === current.value ? "font-semibold" : ""}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
