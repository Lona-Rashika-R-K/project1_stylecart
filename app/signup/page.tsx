"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", phone: "", address: "" });
  const [error, setError] = useState("");

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (Object.values(form).some((value) => !value.trim())) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await signup(form);
      router.push("/home");
    } catch (error) {
      setError(error instanceof Error && error.message.includes("email-already-in-use") ? "Email already registered." : "Signup failed.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-linen px-4 py-10">
      <form onSubmit={submit} className="entrance w-full max-w-2xl space-y-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-leaf text-white">
            <UserPlus />
          </div>
          <h1 className="text-3xl font-black">Create Account</h1>
          <p className="mt-2 text-sm text-black/60">Your profile is stored in Firestore after Firebase signup succeeds.</p>
        </div>
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setField("email", event.target.value)} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(event) => setField("password", event.target.value)} />
          <input className="input" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} />
          <input className="input" placeholder="Phone number" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
          <input className="input" placeholder="Address" value={form.address} onChange={(event) => setField("address", event.target.value)} />
        </div>
        <button className="btn-primary w-full" type="submit">
          Sign up
        </button>
        <p className="text-sm text-black/60">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-ink underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
