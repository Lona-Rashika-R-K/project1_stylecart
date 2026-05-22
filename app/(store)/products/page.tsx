"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

const defaultFilters = {
  search: "",
  category: "",
  size: "",
  color: "",
  stock: "",
  sort: "newest",
  maxPrice: ""
};

function ProductsContent() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    search: params.get("q") ?? "",
    category: params.get("category") ?? ""
  }));

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: params.get("q") ?? "",
      category: params.get("category") ?? ""
    }));
  }, [params]);

  const filtered = useMemo(() => {
    const searchTerms = filters.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const maxPrice = Number(filters.maxPrice);
    const next = products
      .filter((product) => {
        if (!searchTerms.length) return true;
        const searchable = [product.name, product.description, product.category, ...product.colors, ...product.sizes].join(" ").toLowerCase();
        return searchTerms.every((term) => searchable.includes(term));
      })
      .filter((product) => !filters.category || product.category === filters.category)
      .filter((product) => !filters.size || product.sizes.includes(filters.size))
      .filter((product) => !filters.color || product.colors.includes(filters.color))
      .filter((product) => !filters.maxPrice || Number.isNaN(maxPrice) || product.discountPrice <= maxPrice)
      .filter((product) => !filters.stock || (filters.stock === "in" ? product.stock > 0 : product.stock < 1));

    if (filters.sort === "price-asc") next.sort((a, b) => a.discountPrice - b.discountPrice);
    if (filters.sort === "price-desc") next.sort((a, b) => b.discountPrice - a.discountPrice);
    if (filters.sort === "popular") next.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
    return next;
  }, [filters, products]);

  return (
    <main className="page-shell entrance">
      <div className="mb-6">
        <p className="font-bold uppercase tracking-wide text-clay">Catalog</p>
        <h1 className="section-title">Product Listing</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilters
          filters={filters}
          onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
          onReset={() => setFilters(defaultFilters)}
        />
        <div>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
            <span>
              Showing <strong className="text-ink">{filtered.length}</strong> of <strong className="text-ink">{products.length}</strong> products
            </span>
            <span className="hidden font-semibold md:inline">Search, filter, and sort update instantly</span>
          </div>
          {filtered.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-black/20 bg-white p-8 text-center">
              <div>
                <h2 className="text-xl font-black text-ink">No products found</h2>
                <p className="mt-2 text-sm text-black/60">Try clearing filters or searching a broader term.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="page-shell">Loading products...</main>}>
      <ProductsContent />
    </Suspense>
  );
}
