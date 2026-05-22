"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProduct(params.id).then((item) => {
      setProduct(item);
      setSize(item?.sizes[0] ?? "");
      setColor(item?.colors[0] ?? "");
    });
  }, [params.id]);

  const stockLabel = useMemo(() => {
    if (!product || product.stock < 1) return "Out of Stock";
    return product.stock <= 5 ? "Limited Stock" : "In Stock";
  }, [product]);

  if (!product) return <main className="page-shell">Loading product...</main>;

  return (
    <main className="page-shell entrance">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-smoke">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <section className="space-y-6">
          <div>
            <p className="font-bold uppercase tracking-wide text-clay">{product.category}</p>
            <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
            <p className="mt-4 text-black/65">{product.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black">₹{product.discountPrice}</span>
            <span className="text-black/45 line-through">₹{product.price}</span>
          </div>
          <div className="rounded-lg bg-white p-4 font-bold text-leaf">{stockLabel}</div>
          <div>
            <p className="mb-2 font-bold">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button key={item} className={item === size ? "btn-primary" : "btn-secondary"} onClick={() => setSize(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-bold">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((item) => (
                <button key={item} className={item === color ? "btn-primary" : "btn-secondary"} onClick={() => setColor(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex max-w-xs items-center gap-3">
            <button className="btn-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </button>
            <input className="input text-center" type="number" min={1} max={product.stock} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <button className="btn-secondary" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
              +
            </button>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" disabled={product.stock < 1} onClick={() => addToCart(product, size, color, quantity)}>
              <ShoppingBag size={18} />
              Add to cart
            </button>
            <button className="btn-secondary" type="button">
              <Heart size={18} />
              Wishlist
            </button>
          </div>
          <section className="panel">
            <h2 className="text-xl font-black">Reviews</h2>
            <p className="mt-2 text-sm text-black/60">Ratings and written reviews are ready for the future reviews collection.</p>
          </section>
        </section>
      </div>
    </main>
  );
}
