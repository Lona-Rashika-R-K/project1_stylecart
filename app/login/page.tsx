"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail, ShieldCheck, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const profile = await login(email, password);
      router.push(profile?.role === "admin" ? "/admin" : "/home");
    } catch {
      setError("Invalid email or password.");
    }
  }

  async function forgotPassword() {
    setError("");
    setMessage("");
    if (!email) {
      setError("Enter your email before requesting a reset link.");
      return;
    }
    await resetPassword(email);
    setMessage("Password reset email sent.");
  }

  return (
    <main className="grid min-h-screen bg-linen md:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center transition-transform duration-700 hover:scale-105" />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="absolute bottom-10 left-10 max-w-md text-white">
          <p className="text-sm font-bold uppercase tracking-[0.22em]">StyleCart</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Shop the newest everyday fits.</h1>
        </div>
      </section>
      <section className="grid place-items-center px-4 py-10">
        <form onSubmit={submit} className="entrance w-full max-w-md space-y-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-clay text-white">
              <ShoppingBag />
            </div>
            <h2 className="text-3xl font-black">Login to StyleCart</h2>
            <p className="mt-2 text-sm text-black/60">Sign in to shop, save favorites, checkout, and track your orders.</p>
          </div>
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
          {message ? <p className="rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p> : null}
          <input className="input" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="btn-primary w-full" type="submit">
            <Mail size={17} />
            Login
          </button>
          <button
            className="btn-secondary w-full"
            type="button"
            onClick={() => {
              setEmail("demo@stylecart.test");
              setPassword("password123");
            }}
          >
            <ShieldCheck size={17} />
            Fill demo login
          </button>
          <button className="text-sm font-bold text-clay" type="button" onClick={forgotPassword}>
            Forgot password?
          </button>
          <p className="text-sm text-black/60">
            New customer?{" "}
            <Link href="/signup" className="font-bold text-ink underline">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
