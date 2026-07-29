"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import useDebounce from "@/hooks/useDebounce";
import { Search } from "lucide-react";

export default function SearchBar({
  placeholder = "Search products...",
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchText, setSearchText] = useState(
    pathname === "/" ? (searchParams.get("search") ?? "") : "",
  );
  const debouncedText = useDebounce(searchText, 400);

  // update the URL when debounced search term changes
  useEffect(() => {
    // stop if the URL already matches the debounced input
    if (debouncedText === (searchParams.get("search") ?? "")) return;
    const params = new URLSearchParams(
      pathname === "/" ? searchParams.toString() : "",
    );

    if (debouncedText) {
      params.set("search", debouncedText);
    } else {
      params.delete("search");
    }
    params.delete("page");

    router.push(`/?${params.toString()}`);
  }, [debouncedText, pathname, router]);

  // sync the input field if the URL changes externally (e.g., Browser Back button)
  useEffect(() => {
    if (pathname === "/") {
      setSearchText(searchParams.get("search") ?? "");
    } else {
      setSearchText("");
    }
  }, [searchParams, pathname]);

  return (
    <div className={`relative w-full max-w-xl flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full rounded-lg bg-gray-100 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );
}
