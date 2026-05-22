"use client";

import Image from "next/image";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!db) {
      const saved = window.localStorage.getItem(`stylecart-wishlist-${user.uid}`);
      setIds(saved ? JSON.parse(saved) : []);
      return;
    }
    return onSnapshot(doc(db, "wishlist", user.uid), (snapshot) => {
      setIds(snapshot.exists() ? snapshot.data().productIds ?? [] : []);
    });
  }, [user]);

  const wishlist = useMemo(() => products.filter((product) => ids.includes(product.id)), [ids, products]);

  async function remove(id: string) {
    if (!user) return;
    if (!db) {
      const nextIds = ids.filter((item) => item !== id);
      window.localStorage.setItem(`stylecart-wishlist-${user.uid}`, JSON.stringify(nextIds));
      setIds(nextIds);
      return;
    }
    await setDoc(doc(db, "wishlist", user.uid), { userId: user.uid, productIds: ids.filter((item) => item !== id), updatedAt: serverTimestamp() }, { merge: true });
  }

  return (
    <main className="page-shell entrance">
      <h1 className="section-title mb-6">Wishlist</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {wishlist.length ? wishlist.map((product) => (
          <article key={product.id} className="panel grid gap-4 sm:grid-cols-[120px_1fr]">
            <div className="relative h-36 overflow-hidden rounded-md bg-smoke">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold text-clay">{product.category}</p>
                <h2 className="font-black">{product.name}</h2>
                <p className="font-bold">₹{product.discountPrice}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" disabled={product.stock < 1} onClick={() => addToCart(product, product.sizes[0], product.colors[0], 1)}>
                  <ShoppingBag size={17} /> Move to cart
                </button>
                <button className="btn-ghost-square" onClick={() => remove(product.id)} aria-label="Remove">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        )) : <div className="panel">No wishlist items yet.</div>}
      </div>
    </main>
  );
}
