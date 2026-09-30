"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { CATEGORIES, SIZE_RUN } from "@/lib/constants";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

interface ProductBrowserProps {
  products: Product[];
  showCategoryFilter?: boolean;
}

export function ProductBrowser({ products, showCategoryFilter = true }: ProductBrowserProps) {
  const [category, setCategory] = useState<string>("all");
  const [size, setSize] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (size !== "all") {
      result = result.filter((p) => p.sizes.some((s) => s.size === size && s.inStock));
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }

    return result;
  }, [products, category, size, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="flex items-center gap-2 text-[13px] uppercase tracking-widest2 sm:hidden"
          onClick={() => setIsFilterOpen((v) => !v)}
        >
          Filter & Sort
          <span className={cn("transition-transform", isFilterOpen && "rotate-180")}>⌄</span>
        </button>

        <div
          className={cn(
            "flex-col gap-4 sm:flex sm:flex-row sm:items-center sm:gap-6",
            isFilterOpen ? "flex" : "hidden"
          )}
        >
          {showCategoryFilter && (
            <div className="flex flex-wrap gap-2">
              <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
                All
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c.slug}
                  active={category === c.slug}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-taupe">Size:</span>
            <FilterChip active={size === "all"} onClick={() => setSize("all")}>
              All
            </FilterChip>
            {SIZE_RUN.map((s) => (
              <FilterChip key={s} active={size === s} onClick={() => setSize(s)}>
                {s}
              </FilterChip>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs">
          <span className="hidden text-taupe sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border border-line bg-transparent px-3 py-2 text-xs uppercase tracking-wide focus:outline-none"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="py-6 text-xs text-taupe">{filtered.length} pieces</p>

      <ProductGrid products={filtered} />
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors duration-200",
        active ? "border-ink bg-ink text-ivory" : "border-line text-taupe hover:border-ink hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}
