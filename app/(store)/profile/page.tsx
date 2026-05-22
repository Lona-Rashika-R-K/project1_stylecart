"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { getUserOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, profile, updateProfile, uploadProfileImage, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });

  useEffect(() => {
    if (profile) setForm({ fullName: profile.fullName, phone: profile.phone, address: profile.address });
  }, [profile]);

  useEffect(() => {
    if (user) getUserOrders(user.uid).then(setOrders);
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await updateProfile(form);
  }

  return (
    <main className="page-shell entrance">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wide text-clay">Account</p>
          <h1 className="section-title">Profile</h1>
        </div>
        <button className="btn-secondary" onClick={logout}>Logout</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="panel h-fit">
          <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full bg-smoke">
            {profile?.profileImage ? <Image src={profile.profileImage} alt={profile.fullName} fill className="object-cover" /> : null}
          </div>
          <label className="btn-secondary mt-4 w-full cursor-pointer">
            <Camera size={17} />
            Upload image
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadProfileImage(file);
              }}
            />
          </label>
          <div className="mt-5 space-y-2 text-sm">
            <p><b>Email:</b> {profile?.email}</p>
            <p><b>Role:</b> {profile?.role}</p>
            <p><b>Account created:</b> Available in Firestore timestamp</p>
          </div>
        </section>
        <section className="space-y-6">
          <form onSubmit={submit} className="panel space-y-4">
            <h2 className="text-xl font-black">Edit Details</h2>
            <input className="input" placeholder="Full name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            <input className="input" placeholder="Phone number" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <textarea className="textarea" placeholder="Address" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
            <button className="btn-primary" type="submit"><Save size={17} /> Save profile</button>
          </form>
          <section className="panel">
            <h2 className="mb-4 text-xl font-black">Previous Orders</h2>
            <div className="space-y-3">
              {orders.length ? orders.map((order) => (
                <div key={order.id} className="rounded-md bg-smoke p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <b>{order.orderId}</b>
                    <span>{order.orderStatus}</span>
                    <b>₹{order.totalAmount}</b>
                  </div>
                </div>
              )) : <p className="text-black/60">No orders yet.</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
