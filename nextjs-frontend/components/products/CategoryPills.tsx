"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CATEGORIES = ["Footwear", "Audio", "Bags", "Wearables"]; // align with your actual seeded categories

export function CategoryPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = searchParams.get("category")?.split(",") ?? [];

  function toggle(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === null) {
      params.delete("category");
    } else {
      const next = selected.includes(category)
        ? selected.filter((c) => c !== category)
        : [...selected, category];
      next.length
        ? params.set("category", next.join(","))
        : params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Pill active={selected.length === 0} onClick={() => toggle(null)}>
        All
      </Pill>
      {CATEGORIES.map((c) => (
        <Pill key={c} active={selected.includes(c)} onClick={() => toggle(c)}>
          {c}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
    >
      {children}
    </button>
  );
}
