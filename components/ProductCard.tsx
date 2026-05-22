"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const defaultSize = product.sizes[0] ?? "M";
  const defaultColor = product.colors[0] ?? "Black";

  async function addWishlist() {
    if (!user) throw new Error("Login is required.");
    if (!db) {
      const key = `stylecart-wishlist-${user.uid}`;
      const current = window.localStorage.getItem(key);
      const productIds = current ? (JSON.parse(current) as string[]) : [];
      window.localStorage.setItem(key, JSON.stringify(Array.from(new Set([...productIds, product.id]))));
      return;
    }
    const wishlistRef = doc(db, "wishlist", user.uid);
    const current = await getDoc(wishlistRef);
    const productIds = current.exists() ? current.data().productIds ?? [] : [];
    await setDoc(
      wishlistRef,
      { userId: user.uid, productIds: Array.from(new Set([...productIds, product.id])), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-smoke">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
          {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
        </span>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-clay">{product.category}</p>
          <Link href={`/products/${product.id}`} className="mt-1 block text-base font-bold text-ink">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black">Rs. {product.discountPrice}</span>
          <span className="text-sm text-black/45 line-through">Rs. {product.price}</span>
        </div>
        <p className="min-h-5 text-xs text-black/55">{product.sizes.join(" / ")}</p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={product.stock < 1} onClick={() => addToCart(product, defaultSize, defaultColor, 1)}>
            <ShoppingBag size={16} />
            Add
          </button>
          <button className="btn-ghost-square" onClick={addWishlist} aria-label="Add to wishlist" title="Add to wishlist">
            <Heart size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
