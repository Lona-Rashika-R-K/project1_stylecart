"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { findCoupon, calculateTotals, placeOrder } from "@/lib/orders";
import type { Coupon, ShippingDetails } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const initialShipping: ShippingDetails = { fullName: "", phone: "", email: "", address: "", city: "", state: "", postalCode: "", country: "India" };

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items } = useCart();
  const [shipping, setShipping] = useState<ShippingDetails>({ ...initialShipping, fullName: profile?.fullName ?? "", email: profile?.email ?? "", phone: profile?.phone ?? "", address: profile?.address ?? "" });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const totals = calculateTotals(items, coupon);

  useEffect(() => {
    if (!profile) return;
    setShipping((current) => ({
      ...current,
      fullName: current.fullName || profile.fullName,
      email: current.email || profile.email,
      phone: current.phone || profile.phone,
      address: current.address || profile.address
    }));
  }, [profile]);

  function setField(name: string, value: string) {
    setShipping((current) => ({ ...current, [name]: value }));
  }

  async function applyCoupon() {
    const found = await findCoupon(couponCode);
    if (!found) {
      setError("Coupon not found.");
      return;
    }
    setCoupon(found);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!user) return;
    if (!items.length) {
      setError("Cart is empty.");
      return;
    }
    if (Object.values(shipping).some((value) => !value.trim())) {
      setError("All shipping fields are required.");
      return;
    }
    try {
      const order = await placeOrder(user.uid, items, shipping, coupon);
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to place order.");
    }
  }

  return (
    <main className="page-shell entrance">
      <h1 className="section-title mb-6">Checkout</h1>
      {error ? <p className="mb-4 rounded-md bg-red-50 p-3 font-semibold text-red-700">{error}</p> : null}
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel">
          <h2 className="mb-4 text-xl font-black">Shipping Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(shipping).map(([key, value]) => (
              <input key={key} className="input" placeholder={key.replace(/([A-Z])/g, " $1")} value={value} onChange={(event) => setField(key, event.target.value)} />
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-smoke p-4 font-bold">Payment Method: Cash on Delivery</div>
        </section>
        <aside className="panel h-fit space-y-3">
          <h2 className="text-xl font-black">Order Summary</h2>
          <div className="flex gap-2">
            <input className="input" placeholder="STYLE10" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} />
            <button className="btn-secondary" type="button" onClick={applyCoupon}>
              Apply
            </button>
          </div>
          <div className="flex justify-between"><span>Subtotal</span><b>₹{totals.subtotal}</b></div>
          <div className="flex justify-between"><span>Discount</span><b>₹{totals.discount}</b></div>
          <div className="flex justify-between"><span>Delivery</span><b>₹{totals.deliveryCharge}</b></div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-lg"><span>Total</span><b>₹{totals.totalAmount}</b></div>
          <button className="btn-primary w-full" type="submit">
            Place order
          </button>
        </aside>
      </form>
    </main>
  );
}
