"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { getOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";

export default function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const found = await getOrder(orderId);
    setOrder(found);
    if (!found) setError("Order not found.");
  }

  return (
    <main className="page-shell entrance">
      <section className="panel mx-auto max-w-4xl">
        <h1 className="section-title">Order Tracking</h1>
        <form className="mt-5 flex gap-2" onSubmit={submit}>
          <input className="input" placeholder="Enter order ID" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
          <button className="btn-primary" type="submit" aria-label="Track order">
            <Search size={18} />
          </button>
        </form>
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 font-semibold text-red-700">{error}</p> : null}
        {order ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-smoke p-4">
              <b>{order.orderId}</b>
              <span>₹{order.totalAmount}</span>
            </div>
            <OrderStatusStepper status={order.orderStatus} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
