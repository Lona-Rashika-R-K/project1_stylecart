"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrder(params.id).then(setOrder);
  }, [params.id]);

  return (
    <main className="page-shell entrance">
      <section className="panel mx-auto max-w-3xl text-center">
        <CheckCircle2 className="mx-auto text-leaf" size={56} />
        <h1 className="mt-4 text-3xl font-black">Order placed successfully</h1>
        <p className="mt-2 text-black/60">Order ID: {order?.orderId ?? "Loading..."}</p>
        {order ? (
          <div className="mt-6 space-y-2 text-left">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between rounded-md bg-smoke p-3">
                <span>{item.name} x {item.quantity}</span>
                <b>₹{item.price * item.quantity}</b>
              </div>
            ))}
            <div className="flex justify-between pt-3 text-lg font-black">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <p className="rounded-md bg-linen p-3 text-sm">{order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.postalCode}</p>
          </div>
        ) : null}
        <Link className="btn-primary mt-6" href="/profile">
          Go to Profile / My Orders
        </Link>
      </section>
    </main>
  );
}
