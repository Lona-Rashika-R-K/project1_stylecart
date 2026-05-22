"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { categories, colors, sizes } from "@/lib/constants";

type Props = {
  filters: {
    search: string;
    category: string;
    size: string;
    color: string;
    stock: string;
    sort: string;
    maxPrice: string;
  };
  onChange: (name: string, value: string) => void;
  onReset?: () => void;
};

export function ProductFilters({ filters, onChange, onReset }: Props) {
  return (
    <aside className="sticky top-20 space-y-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm transition duration-300 hover:shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold">
          <SlidersHorizontal size={18} />
          Filters
        </div>
        <button className="btn-ghost-square h-9 w-9" type="button" onClick={onReset} aria-label="Reset filters" title="Reset filters">
          <RotateCcw size={16} />
        </button>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/35" size={16} />
        <input className="input pl-9" placeholder="Search name, color, category" value={filters.search} onChange={(event) => onChange("search", event.target.value)} />
      </div>
      <select className="input" value={filters.category} onChange={(event) => onChange("category", event.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <select className="input" value={filters.size} onChange={(event) => onChange("size", event.target.value)}>
        <option value="">All sizes</option>
        {sizes.map((size) => (
          <option key={size}>{size}</option>
        ))}
      </select>
      <select className="input" value={filters.color} onChange={(event) => onChange("color", event.target.value)}>
        <option value="">All colors</option>
        {colors.map((color) => (
          <option key={color}>{color}</option>
        ))}
      </select>
      <input className="input" type="number" placeholder="Max price" value={filters.maxPrice} onChange={(event) => onChange("maxPrice", event.target.value)} />
      <select className="input" value={filters.stock} onChange={(event) => onChange("stock", event.target.value)}>
        <option value="">Any stock</option>
        <option value="in">In stock</option>
        <option value="out">Out of stock</option>
      </select>
      <select className="input" value={filters.sort} onChange={(event) => onChange("sort", event.target.value)}>
        <option value="newest">Newest first</option>
        <option value="price-asc">Price low to high</option>
        <option value="price-desc">Price high to low</option>
        <option value="popular">Popular products</option>
      </select>
    </aside>
  );
}
