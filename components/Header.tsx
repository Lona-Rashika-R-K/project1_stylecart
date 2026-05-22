"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, PackageSearch, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const links = [
  { href: "/home", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/tracking", label: "Track" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const { items } = useCart();
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-linen/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/home" className="text-xl font-black tracking-tight text-ink">
          StyleCart
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`nav-link ${pathname === link.href ? "nav-link-active" : ""}`}>
              {link.label}
            </Link>
          ))}
          {profile?.role === "admin" ? (
            <Link href="/admin" className={`nav-link ${pathname === "/admin" ? "nav-link-active" : ""}`}>
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/wishlist" className="icon-btn" aria-label="Wishlist" title="Wishlist">
            <Heart size={18} />
          </Link>
          <Link href="/tracking" className="icon-btn md:hidden" aria-label="Track orders" title="Track orders">
            <PackageSearch size={18} />
          </Link>
          <Link href="/cart" className="icon-btn relative" aria-label="Cart" title="Cart">
            <ShoppingBag size={18} />
            {quantity ? <span className="cart-badge">{quantity}</span> : null}
          </Link>
          <Link href="/profile" className="icon-btn" aria-label="Profile" title="Profile">
            <UserRound size={18} />
          </Link>
          <button
            className="icon-btn"
            title="Logout"
            aria-label="Logout"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
