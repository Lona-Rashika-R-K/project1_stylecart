"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { categories } from "@/lib/constants";
import { getFeaturedProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getFeaturedProducts().then(setProducts);
  }, []);

  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-24">
          <div className="max-w-2xl entrance">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles size={16} />
              Latest arrivals and limited offers
            </p>
            <h1 className="text-5xl font-black leading-[1.02] md:text-7xl">StyleCart</h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">Responsive Firebase commerce for clothing, footwear, accessories, checkout, profiles, and admin operations.</p>
            <form className="mt-7 flex max-w-xl gap-2" action="/products">
              <input className="input border-white/20 bg-white/95" name="q" placeholder="Search denim, sneakers, dresses..." value={search} onChange={(event) => setSearch(event.target.value)} />
              <button className="btn-primary bg-clay" type="submit" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-bold uppercase tracking-wide text-clay">Categories</p>
            <h2 className="section-title">Shop by department</h2>
          </div>
          <Link className="btn-secondary" href="/products">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {categories.map((category) => (
            <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="rounded-lg border border-black/10 bg-white p-4 font-black transition hover:-translate-y-1 hover:border-clay hover:shadow-soft">
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="mb-5">
          <p className="font-bold uppercase tracking-wide text-clay">Featured</p>
          <h2 className="section-title">Fresh picks</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
