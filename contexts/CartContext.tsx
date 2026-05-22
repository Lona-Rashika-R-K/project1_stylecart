"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { CartItem, Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

type CartContextValue = {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, size: string, color: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    if (!db) {
      const saved = window.localStorage.getItem(`stylecart-cart-${user.uid}`);
      setItems(saved ? JSON.parse(saved) : []);
      return;
    }
    return onSnapshot(doc(db, "cart", user.uid), (snapshot) => {
      setItems(snapshot.exists() ? snapshot.data().items ?? [] : []);
    });
  }, [user]);

  async function persist(nextItems: CartItem[]) {
    if (!user) throw new Error("Login is required to use the cart.");
    if (!db) {
      window.localStorage.setItem(`stylecart-cart-${user.uid}`, JSON.stringify(nextItems));
      setItems(nextItems);
      return;
    }
    await setDoc(doc(db, "cart", user.uid), { userId: user.uid, items: nextItems, updatedAt: serverTimestamp() }, { merge: true });
  }

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      async addToCart(product, size, color, quantity = 1) {
        const existing = items.find((item) => item.productId === product.id && item.size === size && item.color === color);
        const nextItems = existing
          ? items.map((item) =>
              item === existing ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item
            )
          : [
              ...items,
              {
                productId: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                size,
                color,
                quantity,
                image: product.images[0],
                stock: product.stock
              }
            ];
        await persist(nextItems);
      },
      async updateQuantity(productId, size, color, quantity) {
        const nextItems = items
          .map((item) => (item.productId === productId && item.size === size && item.color === color ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0);
        await persist(nextItems);
      },
      async removeItem(productId, size, color) {
        await persist(items.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
      },
      async clearCart() {
        await persist([]);
      }
    }),
    [items, user]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
