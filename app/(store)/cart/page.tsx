"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { calculateTotals } from "@/lib/orders";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const totals = calculateTotals(items);

  return (
    <main className="page-shell entrance">
      <h1 className="section-title mb-6">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <article key={`${item.productId}-${item.size}-${item.color}`} className="panel grid gap-4 md:grid-cols-[96px_1fr_auto]">
                <div className="relative h-24 overflow-hidden rounded-md bg-smoke">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="font-black">{item.name}</h2>
                  <p className="text-sm text-black/60">
                    {item.size} / {item.color}
                  </p>
                  <p className="mt-2 font-bold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}>
                    -
                  </button>
                  <span className="w-8 text-center font-black">{item.quantity}</span>
                  <button className="btn-secondary" onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}>
                    +
                  </button>
                  <button className="btn-ghost-square" onClick={() => removeItem(item.productId, item.size, item.color)} aria-label="Remove item">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="panel">Your cart is empty.</div>
          )}
        </section>
        <aside className="panel h-fit space-y-3">
          <h2 className="text-xl font-black">Order Summary</h2>
          <div className="flex justify-between"><span>Subtotal</span><b>₹{totals.subtotal}</b></div>
          <div className="flex justify-between"><span>Discount</span><b>₹{totals.discount}</b></div>
          <div className="flex justify-between"><span>Delivery</span><b>₹{totals.deliveryCharge}</b></div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-lg"><span>Total</span><b>₹{totals.totalAmount}</b></div>
          <Link className={`btn-primary w-full ${items.length ? "" : "pointer-events-none opacity-50"}`} href="/checkout">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
