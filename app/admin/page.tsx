"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { PackagePlus, Trash2, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { RequireAuth } from "@/components/RequireAuth";
import { categories } from "@/lib/constants";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import { getProducts, removeProduct, saveProduct, uploadProductImage } from "@/lib/catalog";
import type { Order, OrderStatus, Product } from "@/lib/types";

const emptyProduct = {
  name: "",
  description: "",
  category: "Women",
  price: 0,
  discountPrice: 0,
  sizes: "S,M,L",
  colors: "Black,White",
  stock: 0,
  image: "",
  featured: false
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState(emptyProduct);

  async function refresh() {
    setProducts(await getProducts());
    setOrders(await getAllOrders());
  }

  useEffect(() => {
    refresh();
  }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice,
      sizes: product.sizes.join(","),
      colors: product.colors.join(","),
      stock: product.stock,
      image: product.images[0],
      featured: product.featured
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await saveProduct(
      {
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice),
        sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
        colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
        stock: Number(form.stock),
        images: [form.image],
        featured: form.featured
      },
      editingId
    );
    setForm(emptyProduct);
    setEditingId(undefined);
    await refresh();
  }

  return (
    <RequireAuth adminOnly>
      <Header />
      <main className="page-shell entrance">
        <div className="mb-6">
          <p className="font-bold uppercase tracking-wide text-clay">Admin</p>
          <h1 className="section-title">Dashboard</h1>
        </div>
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="panel h-fit space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-black"><PackagePlus size={20} /> Product Form</h2>
            <input className="input" placeholder="Product name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <textarea className="textarea" placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
            <select className="input" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" type="number" placeholder="Price" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
              <input className="input" type="number" placeholder="Discount price" value={form.discountPrice} onChange={(event) => setForm((current) => ({ ...current, discountPrice: Number(event.target.value) }))} />
              <input className="input" placeholder="Sizes comma separated" value={form.sizes} onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))} />
              <input className="input" placeholder="Colors comma separated" value={form.colors} onChange={(event) => setForm((current) => ({ ...current, colors: event.target.value }))} />
              <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) }))} />
              <label className="btn-secondary cursor-pointer">
                <Upload size={17} /> Upload
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const url = await uploadProductImage(file);
                      setForm((current) => ({ ...current, image: url }));
                    }
                  }}
                />
              </label>
            </div>
            <input className="input" placeholder="Product image URL" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} required />
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Featured product
            </label>
            <button className="btn-primary w-full" type="submit">{editingId ? "Update product" : "Add product"}</button>
          </form>

          <section className="space-y-6">
            <div className="panel">
              <h2 className="mb-4 text-xl font-black">Products</h2>
              <div className="grid gap-3">
                {products.map((product) => (
                  <div key={product.id} className="grid gap-3 rounded-lg bg-smoke p-3 md:grid-cols-[72px_1fr_auto]">
                    <div className="relative h-20 overflow-hidden rounded-md bg-white">
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    </div>
                    <div>
                      <b>{product.name}</b>
                      <p className="text-sm text-black/60">{product.category} · ₹{product.discountPrice} · Stock {product.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => edit(product)}>Edit</button>
                      <button className="btn-ghost-square" onClick={async () => { await removeProduct(product.id); await refresh(); }} aria-label="Delete product">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h2 className="mb-4 text-xl font-black">Orders</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="grid gap-3 rounded-lg bg-smoke p-3 md:grid-cols-[1fr_200px]">
                    <div>
                      <b>{order.orderId}</b>
                      <p className="text-sm text-black/60">₹{order.totalAmount} · {order.shippingDetails.fullName}</p>
                    </div>
                    <select
                      className="input"
                      value={order.orderStatus}
                      onChange={async (event) => {
                        await updateOrderStatus(order.id, event.target.value as OrderStatus);
                        await refresh();
                      }}
                    >
                      {["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
