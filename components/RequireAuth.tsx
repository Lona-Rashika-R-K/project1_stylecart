"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    if (adminOnly && profile && profile.role !== "admin") router.replace("/home");
  }, [adminOnly, loading, profile, router, user]);

  if (loading || !user || (adminOnly && profile?.role !== "admin")) {
    return <main className="grid min-h-screen place-items-center bg-linen text-ink">Loading StyleCart...</main>;
  }

  return <>{children}</>;
}
